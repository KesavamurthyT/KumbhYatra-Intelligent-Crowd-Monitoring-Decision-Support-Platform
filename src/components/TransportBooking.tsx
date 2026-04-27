import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Clock, MapPin, Users, Bus, Train, Car, Navigation, RefreshCw, Calendar, CreditCard, Route, AlertTriangle, CheckCircle2, QrCode, Download } from "lucide-react";
import QRCode from "qrcode";

interface TransportOption {
  id: string;
  routeName: string;
  mode: "Bus" | "Shuttle" | "Train";
  departureTime: string;
  arrivalTime: string;
  seatsLeft: number;
  totalSeats: number;
  price: number;
  destination: string;
  isFree: boolean;
  eta?: number; // Added for ETA countdown
  status?: "Board Now" | "Wait for Next" | "Crowded"; // Added for status badges
}

interface Passenger {
  id: string;
  name: string;
  age: string;
  gender: string;
}

interface Booking {
  id: string;
  routeId: string;
  routeName: string;
  mode: string;
  departureTime: string;
  arrivalTime: string;
  passengers: Passenger[];
  totalPrice: number;
  status: "Upcoming" | "Expired" | "Cancelled";
  timestamp: string;
  qrCode: string;
}

// NEW INTERFACES FOR ENHANCED FEATURES
interface ParkingZone {
  id: string;
  name: string;
  coordinates: string;
  available: number;
  total: number;
  status: "Available" | "Filling" | "Full";
  baseRate: number;
  currentRate: number;
}

interface ParkingReservation {
  id: string;
  zoneId: string;
  zoneName: string;
  vehicleNumber: string;
  duration: number;
  slotNumber: string;
  slotPreference: string;
  totalPrice: number;
  timestamp: string;
  status: "Active" | "Expired";
}

interface JourneyPlan {
  id: string;
  from: string;
  to: string;
  preferredTime: string;
  route: {
    steps: Array<{
      mode: string;
      description: string;
      duration: string;
      cost: number;
    }>;
    totalDuration: string;
    totalCost: number;
  };
  timestamp: string;
}

interface CeremonyEvent {
  id: string;
  name: string;
  time: string;
  location: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  crowdLevel: "Low" | "Medium" | "High";
}

const TransportBooking = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // EXISTING STATE
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<TransportOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("");
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [myTickets, setMyTickets] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // NEW STATE FOR ENHANCED FEATURES
  const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);
  const [parkingReservations, setParkingReservations] = useState<ParkingReservation[]>([]);
  const [journeyPlans, setJourneyPlans] = useState<JourneyPlan[]>([]);
  const [ceremonyEvents, setCeremonyEvents] = useState<CeremonyEvent[]>([]);
  
  // Journey planner form state
  const [journeyPlan, setJourneyPlan] = useState({
    from: "",
    to: "",
    time: "now",
    preference: "fastest",
    travelers: 1
  });
  
  // Dialog states
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [reservationForm, setReservationForm] = useState({
    vehicleNumber: "",
    duration: 2,
    slotPreference: "any"
  });
  
  const [journeyForm, setJourneyForm] = useState({
    from: "",
    to: "",
    preferredTime: ""
  });

  // My Bookings UI state
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Mock API data - ENHANCED WITH NEW FEATURES
  const mockTransportOptions: TransportOption[] = [
    {
      id: "bus001",
      routeName: "Bus: Ujjain Gate → Main Ghat",
      mode: "Bus",
      departureTime: "06:00",
      arrivalTime: "06:30",
      seatsLeft: 8,
      totalSeats: 40,
      price: 0,
      destination: "Main Ghat",
      isFree: true,
      eta: 5,
      status: "Crowded"
    },
    {
      id: "shuttle002",
      routeName: "Shuttle: Railway Station → Har Ki Pauri",
      mode: "Shuttle",
      departureTime: "07:15",
      arrivalTime: "07:45",
      seatsLeft: 15,
      totalSeats: 25,
      price: 25,
      destination: "Har Ki Pauri",
      isFree: false,
      eta: 12,
      status: "Board Now"
    },
    {
      id: "bus003",
      routeName: "Bus: City Center → Temple Complex",
      mode: "Bus",
      departureTime: "14:30",
      arrivalTime: "15:00",
      seatsLeft: 2,
      totalSeats: 35,
      price: 0,
      destination: "Temple Complex",
      isFree: true,
      eta: 8,
      status: "Wait for Next"
    },
    {
      id: "train004",
      routeName: "Local Train: Haridwar Junction → Rishikesh",
      mode: "Train",
      departureTime: "16:20",
      arrivalTime: "17:10",
      seatsLeft: 45,
      totalSeats: 100,
      price: 15,
      destination: "Rishikesh",
      isFree: false,
      eta: 3,
      status: "Board Now"
    },
    {
      id: "shuttle005",
      routeName: "Evening Shuttle: Main Ghat → Parking Zone",
      mode: "Shuttle",
      departureTime: "18:00",
      arrivalTime: "18:20",
      seatsLeft: 0,
      totalSeats: 20,
      price: 0,
      destination: "Parking Zone",
      isFree: true,
      eta: 15,
      status: "Crowded"
    }
  ];

  // NEW MOCK DATA FOR ENHANCED FEATURES
  const initializeMockData = () => {
    const zones: ParkingZone[] = [
      {
        id: "zone1",
        name: "Main Ghat Parking",
        coordinates: "29.9457°N, 78.1642°E",
        available: 45,
        total: 200,
        status: "Available",
        baseRate: 20,
        currentRate: 24
      },
      {
        id: "zone2", 
        name: "Temple Complex Parking",
        coordinates: "29.9461°N, 78.1635°E",
        available: 8,
        total: 150,
        status: "Filling",
        baseRate: 25,
        currentRate: 38
      },
      {
        id: "zone3",
        name: "VIP Parking Zone",
        coordinates: "29.9465°N, 78.1628°E",
        available: 0,
        total: 50,
        status: "Full",
        baseRate: 50,
        currentRate: 50
      },
      {
        id: "zone4",
        name: "Riverside Parking",
        coordinates: "29.9450°N, 78.1650°E",
        available: 75,
        total: 120,
        status: "Available",
        baseRate: 15,
        currentRate: 18
      }
    ];

    const ceremonies: CeremonyEvent[] = [
      {
        id: "ceremony1",
        name: "Morning Ganga Aarti",
        time: "06:00",
        location: "Main Ghat",
        status: "Upcoming",
        crowdLevel: "Medium"
      },
      {
        id: "ceremony2",
        name: "Maha Aarti",
        time: "18:00",
        location: "Har Ki Pauri",
        status: "Upcoming",
        crowdLevel: "High"
      },
      {
        id: "ceremony3",
        name: "Shahi Snan",
        time: "12:00",
        location: "Triveni Sangam",
        status: "Upcoming",
        crowdLevel: "High"
      }
    ];

    setParkingZones(zones);
    setCeremonyEvents(ceremonies);
    
    // Save to localStorage
    localStorage.setItem("parking.zones", JSON.stringify(zones));
    localStorage.setItem("transport.routes", JSON.stringify(mockTransportOptions));
  };

  useEffect(() => {
    // Load data from localStorage or initialize
    const savedZones = localStorage.getItem("parking.zones");
    const savedReservations = localStorage.getItem("parking.reservations");
    const savedRoutes = localStorage.getItem("transport.routes");
    const savedJourneyPlans = localStorage.getItem("transport.journeyPlan");

    if (savedZones) setParkingZones(JSON.parse(savedZones));
    if (savedReservations) setParkingReservations(JSON.parse(savedReservations));
    if (savedJourneyPlans) setJourneyPlans(JSON.parse(savedJourneyPlans));

    // Simulate API call for transport
    setTimeout(() => {
      const routes = savedRoutes ? JSON.parse(savedRoutes) : mockTransportOptions;
      setTransportOptions(routes);
      setFilteredOptions(routes);
      setLoading(false);
    }, 1000);

    // Load existing tickets from localStorage
    const savedTickets = localStorage.getItem("myTickets");
    if (savedTickets) {
      setMyTickets(JSON.parse(savedTickets));
    }

    // Initialize with user info
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      setPassengers([{
        id: "main",
        name: profile.name || "",
        age: profile.age || "",
        gender: profile.gender || ""
      }]);
    } else {
      setPassengers([{
        id: "main",
        name: "",
        age: "",
        gender: ""
      }]);
    }

    // Initialize mock data if not present
    if (!savedZones || !savedRoutes) {
      initializeMockData();
    }

    // Auto-update ETA and availability every 5 seconds
    const interval = setInterval(() => {
      updateLiveData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = [...transportOptions];

    // Time filter
    if (timeFilter !== "all") {
      filtered = filtered.filter(option => {
        const hour = parseInt(option.departureTime.split(":")[0]);
        if (timeFilter === "morning") return hour >= 6 && hour < 12;
        if (timeFilter === "afternoon") return hour >= 12 && hour < 18;
        if (timeFilter === "evening") return hour >= 18 || hour < 6;
        return true;
      });
    }

    // Destination filter
    if (destinationFilter) {
      filtered = filtered.filter(option => 
        option.destination.toLowerCase().includes(destinationFilter.toLowerCase())
      );
    }

    setFilteredOptions(filtered);
  }, [timeFilter, destinationFilter, transportOptions]);

  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    if (hour >= 6 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 18) return "Afternoon";
    return "Evening";
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "Bus": return <Bus className="w-5 h-5" />;
      case "Train": return <Train className="w-5 h-5" />;
      case "Shuttle": return <Car className="w-5 h-5" />;
      default: return <Bus className="w-5 h-5" />;
    }
  };

  const getTranslatedMode = (mode: string) => {
    switch (mode) {
      case "Bus": return t.transport.bus;
      case "Train": return t.transport.train;
      case "Shuttle": return t.transport.shuttle;
      default: return mode;
    }
  };

  const getStatusColor = (seatsLeft: number, totalSeats: number) => {
    const percentage = (seatsLeft / totalSeats) * 100;
    if (percentage === 0) return "bg-red-500";
    if (percentage < 20) return "bg-orange-500";
    return "bg-green-500";
  };

  // NEW ENHANCED UTILITY FUNCTIONS
  const updateLiveData = () => {
    // Update transport ETA and status
    setTransportOptions(prev => prev.map(route => {
      const newEta = Math.max(1, (route.eta || 5) + (Math.random() > 0.5 ? -1 : 1));
      const occupancyChange = Math.floor(Math.random() * 3) - 1;
      const newSeatsLeft = Math.max(0, Math.min(route.totalSeats, route.seatsLeft + occupancyChange));
      
      let status: "Board Now" | "Wait for Next" | "Crowded" = "Board Now";
      const occupancyRate = 1 - (newSeatsLeft / route.totalSeats);
      if (occupancyRate > 0.8) status = "Crowded";
      else if (newEta > 10) status = "Wait for Next";
      
      return { ...route, eta: newEta, seatsLeft: newSeatsLeft, status };
    }));

    // Update parking availability
    setParkingZones(prev => prev.map(zone => {
      const randomChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const newAvailable = Math.max(0, Math.min(zone.total, zone.available + randomChange));
      const percentage = (newAvailable / zone.total) * 100;
      
      let status: "Available" | "Filling" | "Full" = "Available";
      if (percentage === 0) status = "Full";
      else if (percentage < 20) status = "Filling";
      
      // Dynamic pricing based on availability
      const demandFactor = 1 + (1 - newAvailable / zone.total) * 0.5;
      const currentRate = Math.ceil(zone.baseRate * demandFactor);
      
      return { ...zone, available: newAvailable, status, currentRate };
    }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Available": case "Board Now": return "bg-green-500";
      case "Filling": case "Wait for Next": return "bg-yellow-500";
      case "Full": case "Crowded": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // PARKING FUNCTIONS
  const handleParkingReservation = () => {
    if (!selectedZone || !reservationForm.vehicleNumber) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const reservation: ParkingReservation = {
      id: `res_${Date.now()}`,
      zoneId: selectedZone.id,
      zoneName: selectedZone.name,
      vehicleNumber: reservationForm.vehicleNumber,
      duration: reservationForm.duration,
      slotNumber: `${selectedZone.name.charAt(0)}${Math.floor(Math.random() * 99) + 1}`,
      slotPreference: reservationForm.slotPreference,
      totalPrice: selectedZone.currentRate * reservationForm.duration,
      timestamp: new Date().toISOString(),
      status: "Active"
    };

    const updatedReservations = [...parkingReservations, reservation];
    setParkingReservations(updatedReservations);
    localStorage.setItem("parking.reservations", JSON.stringify(updatedReservations));

    // Update zone availability
    const updatedZones = parkingZones.map(zone => 
      zone.id === selectedZone.id 
        ? { ...zone, available: Math.max(0, zone.available - 1) }
        : zone
    );
    setParkingZones(updatedZones);
    localStorage.setItem("parking.zones", JSON.stringify(updatedZones));

    toast({
      title: "Success",
      description: "Reservation Confirmed!",
    });
    setSelectedZone(null);
    setReservationForm({ vehicleNumber: "", duration: 2, slotPreference: "any" });
  };

  // JOURNEY PLANNER FUNCTIONS
  const handleJourneyPlan = () => {
    if (!journeyForm.from || !journeyForm.to) {
      toast({
        title: "Error",
        description: "Please fill origin and destination",
        variant: "destructive"
      });
      return;
    }

    const mockRoute = {
      steps: [
        { mode: "Walk", description: `Walk to nearest bus stop from ${journeyForm.from}`, duration: "5 min", cost: 0 },
        { mode: "Bus", description: "Bus Route 12A to Temple Complex", duration: "20 min", cost: 15 },
        { mode: "Walk", description: `Walk to ${journeyForm.to}`, duration: "8 min", cost: 0 }
      ],
      totalDuration: "33 min",
      totalCost: 15
    };

    const plan: JourneyPlan = {
      id: `plan_${Date.now()}`,
      from: journeyForm.from,
      to: journeyForm.to,
      preferredTime: journeyForm.preferredTime,
      route: mockRoute,
      timestamp: new Date().toISOString()
    };

    const updatedPlans = [...journeyPlans, plan];
    setJourneyPlans(updatedPlans);
    localStorage.setItem("transport.journeyPlan", JSON.stringify(updatedPlans));

    toast({
      title: "Success",
      description: "Journey planned successfully!",
    });
    setJourneyForm({ from: "", to: "", preferredTime: "" });
  };

  const resetDemoData = () => {
    localStorage.removeItem("parking.zones");
    localStorage.removeItem("parking.reservations");
    localStorage.removeItem("transport.routes");
    localStorage.removeItem("transport.journeyPlan");
    
    setParkingReservations([]);
    setJourneyPlans([]);
    initializeMockData();
    
    toast({
      title: "Success",
      description: "Demo data reset successfully!",
    });
  };

  // Ticket Management Functions
  const downloadQR = (ticket: Booking) => {
    // Create a download link for the QR code
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `ticket-${ticket.id}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "QR code saved to your device",
    });
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming": return "bg-green-500";
      case "Cancelled": return "bg-red-500";
      case "Expired": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Upcoming": return "default";
      case "Cancelled": return "destructive";
      case "Expired": return "secondary";
      default: return "secondary";
    }
  };

  const addPassenger = () => {
    const newId = `passenger_${Date.now()}`;
    setPassengers([...passengers, { id: newId, name: "", age: "", gender: "" }]);
  };

  const removePassenger = (id: string) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  const updatePassenger = (id: string, field: keyof Passenger, value: string) => {
    setPassengers(passengers.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleBookNow = async () => {
    const selectedOption = transportOptions.find(opt => opt.id === selectedRoute);
    if (!selectedOption) return;

    // Validation
    const isValid = passengers.every(p => p.name && p.age && p.gender);
    if (!isValid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all passenger details",
        variant: "destructive"
      });
      return;
    }

    if (passengers.length > selectedOption.seatsLeft) {
      toast({
        title: "Not Enough Seats",
        description: `Only ${selectedOption.seatsLeft} seats available`,
        variant: "destructive"
      });
      return;
    }

    // Generate QR Code
    const bookingId = `TKT${Date.now()}`;
    const qrData = JSON.stringify({
      bookingId,
      routeId: selectedRoute,
      userId: "current_user",
      timestamp: new Date().toISOString()
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    // Create booking
    const newBooking: Booking = {
      id: bookingId,
      routeId: selectedRoute,
      routeName: selectedOption.routeName,
      mode: selectedOption.mode,
      departureTime: selectedOption.departureTime,
      arrivalTime: selectedOption.arrivalTime,
      passengers: [...passengers],
      totalPrice: selectedOption.price * passengers.length,
      status: "Upcoming",
      timestamp: new Date().toISOString(),
      qrCode: qrCodeDataURL
    };

    // Update seats
    setTransportOptions(prev => 
      prev.map(opt => 
        opt.id === selectedRoute 
          ? { ...opt, seatsLeft: opt.seatsLeft - passengers.length }
          : opt
      )
    );

    // Save to localStorage
    const updatedTickets = [...myTickets, newBooking];
    setMyTickets(updatedTickets);
    localStorage.setItem("myTickets", JSON.stringify(updatedTickets));

    setCurrentBooking(newBooking);
    setShowBookingModal(false);
    setShowConfirmationModal(true);

    toast({
      title: "✅ Your ticket is booked!",
      description: "Saved to My Bookings",
    });
  };

  const cancelTicket = (ticketId: string) => {
    setMyTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: "Cancelled" as const }
          : ticket
      )
    );

    // Update localStorage
    const updatedTickets = myTickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: "Cancelled" as const }
        : ticket
    );
    localStorage.setItem("myTickets", JSON.stringify(updatedTickets));

    toast({
      title: "Your ticket has been cancelled",
      description: "Refund will be processed if applicable",
    });
  };

  const groupedOptions = filteredOptions.reduce((acc, option) => {
    if (!acc[option.mode]) acc[option.mode] = [];
    acc[option.mode].push(option);
    return acc;
  }, {} as Record<string, TransportOption[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Reset Demo Data Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🚌 {t.transport.intelligence}</h2>
          <p className="text-gray-600">{t.transport.smartMobility}</p>
        </div>
        <Button onClick={resetDemoData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t.transport.resetDemo}
        </Button>
      </div>

      {/* Main Accordion with 3 Sections */}
      <Accordion type="multiple" className="space-y-4" defaultValue={["transport"]}>
        
        {/* ============= SMART PARKING MANAGEMENT SECTION ============= */}
        <AccordionItem value="parking" className="border rounded-2xl bg-white shadow-lg">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900 hover:no-underline">
            <div className="flex items-center space-x-3">
              <Car className="w-6 h-6 text-blue-600" />
              <span>{t.transport.smartParking}</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {parkingZones.filter(z => z.status === "Available").length} {t.transport.available}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            
            {/* Parking Zones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {parkingZones.map((zone) => (
                <Card key={zone.id} className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <Badge className={`${getStatusBadgeColor(zone.status)} text-white`}>
                        {zone.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {zone.coordinates}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Availability</span>
                          <span>{zone.available}/{zone.total}</span>
                        </div>
                        <Progress value={(zone.available / zone.total) * 100} className="h-2" />
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Base Rate:</span>
                          <span>₹{zone.baseRate}/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Rate:</span>
                          <span className="font-semibold text-orange-600">₹{zone.currentRate}/hr</span>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full" 
                            disabled={zone.status === "Full"}
                            onClick={() => setSelectedZone(zone)}
                          >
                            {zone.status === "Full" ? "Full" : "Reserve Space"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Reserve Parking - {selectedZone?.name}</DialogTitle>
                            <DialogDescription>
                              Complete your parking reservation
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="vehicle">Vehicle Number</Label>
                              <Input
                                id="vehicle"
                                placeholder="e.g., UP16AB1234"
                                value={reservationForm.vehicleNumber}
                                onChange={(e) => setReservationForm({...reservationForm, vehicleNumber: e.target.value})}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="duration">Duration (hours)</Label>
                              <Select value={reservationForm.duration.toString()} onValueChange={(value) => setReservationForm({...reservationForm, duration: parseInt(value)})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 hour</SelectItem>
                                  <SelectItem value="2">2 hours</SelectItem>
                                  <SelectItem value="4">4 hours</SelectItem>
                                  <SelectItem value="8">8 hours</SelectItem>
                                  <SelectItem value="24">Full day</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="preference">Slot Preference</Label>
                              <Select value={reservationForm.slotPreference} onValueChange={(value) => setReservationForm({...reservationForm, slotPreference: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="any">Any Available</SelectItem>
                                  <SelectItem value="near">Near Entrance</SelectItem>
                                  <SelectItem value="shade">Shaded Area</SelectItem>
                                  <SelectItem value="security">Near Security</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {selectedZone && (
                              <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">Total Cost:</span>
                                  <span className="text-lg font-bold text-orange-600">
                                    ₹{selectedZone.currentRate * reservationForm.duration}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Dynamic pricing based on demand
                                </div>
                              </div>
                            )}
                            
                            <Button onClick={handleParkingReservation} className="w-full">
                              Confirm Reservation
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Active Parking Reservations */}
            {parkingReservations.length > 0 && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Your Parking Reservations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parkingReservations.filter(r => r.status === "Active").map((reservation) => (
                      <div key={reservation.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{reservation.zoneName}</h4>
                            <p className="text-sm text-gray-600">{t.transport.slot}: {reservation.slotNumber}</p>
                            <p className="text-sm text-gray-600">{t.transport.vehicle}: {reservation.vehicleNumber}</p>
                            <p className="text-sm text-gray-600">{t.transport.duration}: {reservation.duration} {t.transport.hours}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">₹{reservation.totalPrice}</div>
                            <Button size="sm" variant="outline" className="mt-2">
                              <Navigation className="w-4 h-4 mr-1" />
                              Get Directions
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ============= ENHANCED PUBLIC TRANSPORT SECTION ============= */}
        <AccordionItem value="transport" className="border rounded-2xl bg-white shadow-lg">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900 hover:no-underline">
            <div className="flex items-center space-x-3">
              <Bus className="w-6 h-6 text-green-600" />
              <span>{t.transport.publicTransport}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {filteredOptions.filter(r => r.status === "Board Now").length} {t.transport.readyToBoard}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            
            {/* EXISTING TRANSPORT CONTENT - PRESERVED */}
            {/* Filters */}
            <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t.transport.findTransport}</CardTitle>
          <CardDescription>{t.transport.browseTransportOptions}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t.transport.departureTime}</Label>
              <RadioGroup value={timeFilter} onValueChange={setTimeFilter} className="flex flex-row space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">{t.transport.all}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="morning" />
                  <Label htmlFor="morning">{t.transport.morning}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <Label htmlFor="afternoon">{t.transport.afternoon}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="evening" />
                  <Label htmlFor="evening">{t.transport.evening}</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>{t.transport.destination}</Label>
              <Input
                placeholder={t.transport.searchDestination}
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transport Options */}
      <Card>
        <CardHeader>
          <CardTitle>{t.transport.availableTransport} ({filteredOptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedOptions).length === 0 ? (
            <div className="text-center py-8">
              <Bus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">{t.transport.noTransportAvailable}</p>
              <Button variant="outline" className="mt-4">{t.transport.contactSupport}</Button>
            </div>
          ) : (
            <Accordion type="single" collapsible defaultValue="Bus" className="space-y-2">
              {Object.entries(groupedOptions).map(([mode, options]) => (
                <AccordionItem key={mode} value={mode}>
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center space-x-2">
                      {getModeIcon(mode)}
                      <span>{getTranslatedMode(mode)} ({options.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {options.map((option) => {
                      const occupancyPercentage = ((option.totalSeats - option.seatsLeft) / option.totalSeats) * 100;
                      const isSelected = selectedRoute === option.id;
                      const isFull = option.seatsLeft === 0;
                      
                      return (
                        <Card 
                          key={option.id} 
                          className={`cursor-pointer transition-all ${
                            isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
                          } ${isFull ? 'opacity-60' : 'hover:shadow-md'}`}
                          onClick={() => !isFull && setSelectedRoute(option.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{option.routeName}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{option.departureTime} - {option.arrivalTime}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{option.destination}</span>
                                  </div>
                                  <Badge variant="outline">
                                    {getTimeOfDay(option.departureTime)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {option.isFree ? "Free" : `₹${option.price}`}
                                </div>
                                <Badge variant={isFull ? "destructive" : "secondary"}>
                                  {isFull ? "Full" : `${option.seatsLeft} seats left`}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Capacity</span>
                                <span>{option.totalSeats - option.seatsLeft}/{option.totalSeats}</span>
                              </div>
                              <Progress value={occupancyPercentage} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Book Button */}
      {selectedRoute && (
        <Card>
          <CardContent className="p-4">
            <Button 
              onClick={() => setShowBookingModal(true)}
              className="w-full"
              size="lg"
            >
              {t.transport.bookSelectedTransport}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.transport.passengerDetails}</DialogTitle>
            <DialogDescription>
              {t.transport.errors.providePassengerDetails}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {passengers.map((passenger, index) => (
              <Card key={passenger.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">
                      {index === 0 ? "Primary Passenger" : `Passenger ${index + 1}`}
                    </CardTitle>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePassenger(passenger.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={passenger.name}
                      onChange={(e) => updatePassenger(passenger.id, "name", e.target.value)}
                      placeholder={t.transport.fullNamePlaceholder}
                    />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={passenger.age}
                      onChange={(e) => updatePassenger(passenger.id, "age", e.target.value)}
                      placeholder={t.transport.agePlaceholder}
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select
                      value={passenger.gender}
                      onValueChange={(value) => updatePassenger(passenger.id, "gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.transport.selectPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="outline"
              onClick={addPassenger}
              className="w-full"
              disabled={passengers.length >= (transportOptions.find(opt => opt.id === selectedRoute)?.seatsLeft || 0)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Passenger
            </Button>
            
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
                {t.common.cancel}
              </Button>
              <Button onClick={handleBookNow} className="flex-1">
                {t.transport.bookRide}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600">{t.transport.bookingConfirmedTitle}</DialogTitle>
            <DialogDescription>
              {t.transport.ticketSuccessfullyBooked}
            </DialogDescription>
          </DialogHeader>
          
          {currentBooking && (
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={currentBooking.qrCode} 
                  alt={t.transport.qrCodeAlt}
                  className="mx-auto mb-4 w-32 h-32"
                />
                <p className="text-sm text-gray-600">
                  {t.transport.showQrCode}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>{t.transport.bookingId}:</span>
                  <span className="font-mono">{currentBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Route:</span>
                  <span>{currentBooking.routeName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passengers:</span>
                  <span>{currentBooking.passengers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-semibold">
                    {currentBooking.totalPrice === 0 ? "Free" : `₹${currentBooking.totalPrice}`}
                  </span>
                </div>
              </div>
              
              <Button onClick={() => setShowConfirmationModal(false)} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
          
          </AccordionContent>
        </AccordionItem>

        {/* ============= JOURNEY PLANNER SECTION ============= */}
        <AccordionItem value="journey" className="border rounded-2xl bg-white shadow-lg">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900 hover:no-underline">
            <div className="flex items-center space-x-3">
              <Route className="w-6 h-6 text-purple-600" />
              <span>{t.transport.journeyPlanner}</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {t.transport.smartRoutes}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            
            {/* Journey Planner Card */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Route className="w-5 h-5 mr-2" />
                  Plan Your Journey
                </CardTitle>
                <CardDescription>
                  Get optimal routes combining multiple transport modes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="from">From</Label>
                    <Select value={journeyPlan.from} onValueChange={(value) => setJourneyPlan({...journeyPlan, from: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.transport.selectStartingPoint} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sector1">Sector 1 - Main Entrance</SelectItem>
                        <SelectItem value="sector2">Sector 2 - VIP Area</SelectItem>
                        <SelectItem value="sector3">Sector 3 - Sangam Area</SelectItem>
                        <SelectItem value="sector4">Sector 4 - Parking Zone</SelectItem>
                        <SelectItem value="railway">Railway Station</SelectItem>
                        <SelectItem value="airport">Airport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="to">To</Label>
                    <Select value={journeyPlan.to} onValueChange={(value) => setJourneyPlan({...journeyPlan, to: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.transport.selectDestination} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sector1">Sector 1 - Main Entrance</SelectItem>
                        <SelectItem value="sector2">Sector 2 - VIP Area</SelectItem>
                        <SelectItem value="sector3">Sector 3 - Sangam Area</SelectItem>
                        <SelectItem value="sector4">Sector 4 - Parking Zone</SelectItem>
                        <SelectItem value="railway">Railway Station</SelectItem>
                        <SelectItem value="airport">Airport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label htmlFor="time">Departure Time</Label>
                    <Select value={journeyPlan.time} onValueChange={(value) => setJourneyPlan({...journeyPlan, time: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.transport.selectTime} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Now</SelectItem>
                        <SelectItem value="06:00">06:00 AM</SelectItem>
                        <SelectItem value="09:00">09:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="15:00">03:00 PM</SelectItem>
                        <SelectItem value="18:00">06:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="preference">Route Preference</Label>
                    <Select value={journeyPlan.preference} onValueChange={(value) => setJourneyPlan({...journeyPlan, preference: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.transport.selectPreference} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fastest">Fastest Route</SelectItem>
                        <SelectItem value="cheapest">Cheapest Route</SelectItem>
                        <SelectItem value="comfortable">Most Comfortable</SelectItem>
                        <SelectItem value="direct">Least Transfers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="travelers">Travelers</Label>
                    <Select value={journeyPlan.travelers.toString()} onValueChange={(value) => setJourneyPlan({...journeyPlan, travelers: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 person</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="3">3 people</SelectItem>
                        <SelectItem value="4">4 people</SelectItem>
                        <SelectItem value="5">5+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={handleJourneyPlan} className="w-full mb-6">
                  <Route className="w-4 h-4 mr-2" />
                  Find Best Routes
                </Button>
                
                {/* Route Suggestions */}
                {journeyPlan.from && journeyPlan.to && journeyPlan.from !== journeyPlan.to && (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center">
                      <Route className="w-4 h-4 mr-2" />
                      Suggested Routes
                    </h4>
                    
                    {/* Route Option 1 - Direct */}
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-green-700">{t.transport.directRoute}</h5>
                            <p className="text-sm text-gray-600">{t.transport.singleTransportMode}</p>
                          </div>
                          <Badge className="bg-green-500 text-white">{t.transport.fastest}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Bus className="w-4 h-4 mr-1" />
                            <span>Express Bus</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>15 mins</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            <span>₹20</span>
                          </div>
                        </div>
                        <Button size="sm" className="mt-3">Book This Route</Button>
                      </CardContent>
                    </Card>
                    
                    {/* Route Option 2 - Multi-modal */}
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-blue-700">Multi-Modal Route</h5>
                            <p className="text-sm text-gray-600">Bus + Shuttle combination</p>
                          </div>
                          <Badge className="bg-blue-500 text-white">Cheapest</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Bus className="w-4 h-4 mr-1" />
                            <span>Bus → Shuttle</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>25 mins</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            <span>₹15</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="mt-3">Book This Route</Button>
                      </CardContent>
                    </Card>
                    
                    {/* Route Option 3 - Premium */}
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-purple-700">Premium Route</h5>
                            <p className="text-sm text-gray-600">AC shuttle with reserved seating</p>
                          </div>
                          <Badge className="bg-purple-500 text-white">Comfortable</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Car className="w-4 h-4 mr-1" />
                            <span>Premium Shuttle</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>18 mins</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            <span>₹50</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="mt-3">Book This Route</Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Ceremony Schedule Integration */}
            <Card className="rounded-2xl mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Ceremony Timeline
                </CardTitle>
                <CardDescription>
                  Plan transport around major ceremonies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ceremonyEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-gray-600">{event.time} | {event.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={event.crowdLevel === "High" ? "destructive" : event.crowdLevel === "Medium" ? "default" : "secondary"}>
                          {event.crowdLevel} Crowd
                        </Badge>
                        <Button size="sm" variant="outline">
                          Plan Transport
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
          </AccordionContent>
        </AccordionItem>

        {/* ============= MY BOOKINGS SECTION ============= */}
        <AccordionItem value="bookings" className="border rounded-2xl bg-white shadow-lg">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900 hover:no-underline">
            <div className="flex items-center space-x-3">
              <QrCode className="w-6 h-6 text-blue-600" />
              <span>{t.transport.currentBookings}</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {myTickets.filter(ticket => ticket.status === "Upcoming").length} Active
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            
            {myTickets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <QrCode className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
                  <p className="text-gray-600 text-center mb-4">
                    You haven't booked any transport tickets yet.<br />
                    Use the Public Transport section above to book your first ticket.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                
                {/* Upcoming Tickets */}
                {myTickets.filter(ticket => ticket.status === "Upcoming").length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Upcoming Journeys ({myTickets.filter(ticket => ticket.status === "Upcoming").length})</h3>
                    <div className="space-y-4">
                      {myTickets.filter(ticket => ticket.status === "Upcoming").map((ticket) => (
                        <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="text-lg font-semibold">{ticket.routeName}</h4>
                                  <Badge variant={getStatusVariant(ticket.status)}>
                                    {ticket.status}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{ticket.departureTime} - {ticket.arrivalTime}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4" />
                                    <span>{ticket.passengers.length} passenger(s)</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold">
                                      {ticket.totalPrice === 0 ? "Free" : `₹${ticket.totalPrice}`}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-xs text-gray-500">
                                  <span>Booking ID: </span>
                                  <span className="font-mono">{ticket.id}</span>
                                  <span className="ml-4">Booked: {new Date(ticket.timestamp).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div className="ml-4">
                                <img 
                                  src={ticket.qrCode} 
                                  alt={t.transport.qrCodeAlt}
                                  className="w-20 h-20 cursor-pointer border rounded"
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                    setShowQRModal(true);
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                    setShowQRModal(true);
                                  }}
                                >
                                  <QrCode className="w-4 h-4 mr-2" />
                                  View QR
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadQR(ticket)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </div>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Are you sure you want to cancel this ticket?")) {
                                    cancelTicket(ticket.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Tickets */}
                {myTickets.filter(ticket => ticket.status !== "Upcoming").length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Past Tickets ({myTickets.filter(ticket => ticket.status !== "Upcoming").length})</h3>
                    <div className="space-y-4">
                      {myTickets.filter(ticket => ticket.status !== "Upcoming").map((ticket) => (
                        <Card key={ticket.id} className="opacity-75">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium">{ticket.routeName}</h4>
                                  <Badge variant={getStatusVariant(ticket.status)}>
                                    {ticket.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span>{ticket.departureTime} - {ticket.arrivalTime}</span>
                                  <span className="ml-4">{ticket.passengers.length} passenger(s)</span>
                                  <span className="ml-4 font-mono">{ticket.id}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {ticket.totalPrice === 0 ? "Free" : `₹${ticket.totalPrice}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(ticket.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QR Code Modal */}
            <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Travel QR Code</DialogTitle>
                  <DialogDescription>
                    Show this QR code at the boarding point
                  </DialogDescription>
                </DialogHeader>
                
                {selectedTicket && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img 
                        src={selectedTicket.qrCode} 
                        alt={t.transport.qrCodeAlt}
                        className="mx-auto mb-4 w-48 h-48 border rounded"
                      />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route:</span>
                        <span className="font-medium">{selectedTicket.routeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                          {selectedTicket.departureTime} - {selectedTicket.arrivalTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Passengers:</span>
                        <span className="font-medium">{selectedTicket.passengers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking ID:</span>
                        <span className="font-mono text-xs">{selectedTicket.id}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => downloadQR(selectedTicket)}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        onClick={() => setShowQRModal(false)}
                        className="w-full"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TransportBooking;
