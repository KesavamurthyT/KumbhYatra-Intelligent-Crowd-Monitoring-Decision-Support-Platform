import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Car, 
  Bus, 
  Train, 
  MapPin, 
  Clock, 
  Users, 
  Navigation, 
  RefreshCw,
  Calendar,
  CreditCard,
  Phone,
  Share2,
  AlertTriangle
} from "lucide-react";

// ============= INTERFACES =============
interface ParkingZone {
  id: string;
  name: string;
  coordinates: string;
  available: number;
  total: number;
  status: "Available" | "Filling" | "Full";
  pricing: {
    hourly: number;
    demandMultiplier: number;
  };
}

interface ParkingReservation {
  id: string;
  zoneId: string;
  zoneName: string;
  vehicleNumber: string;
  duration: number;
  slotNumber: string;
  totalPrice: number;
  timestamp: string;
  status: "Active" | "Expired";
}

interface TransportRoute {
  id: string;
  routeName: string;
  mode: "Bus" | "Shuttle" | "Train";
  departureTime: string;
  arrivalTime: string;
  eta: number; // minutes
  capacity: number;
  occupied: number;
  price: number;
  destination: string;
  status: "Board Now" | "Wait for Next" | "Crowded";
  isFree: boolean;
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

interface RideShareBooking {
  id: string;
  type: "ride" | "emergency";
  from: string;
  to: string;
  passengers: number;
  estimatedFare: number;
  estimatedTime: string;
  driverInfo?: {
    name: string;
    vehicle: string;
    rating: number;
  };
  status: "Requested" | "Confirmed" | "En Route" | "Completed";
  timestamp: string;
}

interface CeremonyEvent {
  id: string;
  name: string;
  time: string;
  location: string;
  status: "Upcoming" | "Ongoing" | "Completed";
}

const TransportIntelligence = () => {
  // ============= STATE MANAGEMENT =============
  const { t } = useTranslation();
  const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);
  const [parkingReservations, setParkingReservations] = useState<ParkingReservation[]>([]);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  const [journeyPlans, setJourneyPlans] = useState<JourneyPlan[]>([]);
  const [rideShareBookings, setRideShareBookings] = useState<RideShareBooking[]>([]);
  const [ceremonyEvents, setCeremonyEvents] = useState<CeremonyEvent[]>([]);
  
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
  
  const [rideShareForm, setRideShareForm] = useState({
    from: "",
    to: "",
    passengers: 1,
    isEmergency: false,
    contactNumber: "",
    description: ""
  });

  // ============= MOCK DATA =============
  const initializeMockData = () => {
    const zones: ParkingZone[] = [
      {
        id: "zone1",
        name: "Main Ghat Parking",
        coordinates: "29.9457°N, 78.1642°E",
        available: 45,
        total: 200,
        status: "Available",
        pricing: { hourly: 20, demandMultiplier: 1.2 }
      },
      {
        id: "zone2", 
        name: "Temple Complex Parking",
        coordinates: "29.9461°N, 78.1635°E",
        available: 8,
        total: 150,
        status: "Filling",
        pricing: { hourly: 25, demandMultiplier: 1.5 }
      },
      {
        id: "zone3",
        name: "VIP Parking Zone",
        coordinates: "29.9465°N, 78.1628°E",
        available: 0,
        total: 50,
        status: "Full",
        pricing: { hourly: 50, demandMultiplier: 2.0 }
      },
      {
        id: "zone4",
        name: "Riverside Parking",
        coordinates: "29.9450°N, 78.1650°E",
        available: 75,
        total: 120,
        status: "Available",
        pricing: { hourly: 15, demandMultiplier: 1.0 }
      }
    ];

    const routes: TransportRoute[] = [
      {
        id: "route1",
        routeName: "Main Ghat Express",
        mode: "Bus",
        departureTime: "06:00",
        arrivalTime: "06:30",
        eta: 8,
        capacity: 40,
        occupied: 32,
        price: 0,
        destination: "Main Ghat",
        status: "Crowded",
        isFree: true
      },
      {
        id: "route2",
        routeName: "Temple Shuttle",
        mode: "Shuttle",
        departureTime: "07:15",
        arrivalTime: "07:45",
        eta: 15,
        capacity: 25,
        occupied: 10,
        price: 25,
        destination: "Temple Complex",
        status: "Board Now",
        isFree: false
      },
      {
        id: "route3",
        routeName: "Haridwar Express",
        mode: "Train",
        departureTime: "16:20",
        arrivalTime: "17:10",
        eta: 3,
        capacity: 100,
        occupied: 45,
        price: 15,
        destination: "Haridwar Junction",
        status: "Board Now",
        isFree: false
      }
    ];

    const ceremonies: CeremonyEvent[] = [
      {
        id: "ceremony1",
        name: "Morning Ganga Aarti",
        time: "06:00",
        location: "Main Ghat",
        status: "Upcoming"
      },
      {
        id: "ceremony2",
        name: "Maha Aarti",
        time: "18:00",
        location: "Har Ki Pauri",
        status: "Upcoming"
      },
      {
        id: "ceremony3",
        name: "Shahi Snan",
        time: "12:00",
        location: "Triveni Sangam",
        status: "Upcoming"
      }
    ];

    setParkingZones(zones);
    setTransportRoutes(routes);
    setCeremonyEvents(ceremonies);
    
    // Save to localStorage
    localStorage.setItem("parking.zones", JSON.stringify(zones));
    localStorage.setItem("transport.routes", JSON.stringify(routes));
  };

  // ============= EFFECTS =============
  useEffect(() => {
    // Load data from localStorage or initialize
    const savedZones = localStorage.getItem("parking.zones");
    const savedReservations = localStorage.getItem("parking.reservations");
    const savedRoutes = localStorage.getItem("transport.routes");
    const savedJourneyPlans = localStorage.getItem("transport.journeyPlan");
    const savedRideBookings = localStorage.getItem("rideshare.bookings");

    try {
      // Validate and load zones with proper structure check
      if (savedZones) {
        const zones = JSON.parse(savedZones);
        const validZones = zones.every((zone: any) => zone.pricing && zone.pricing.hourly !== undefined);
        if (validZones) {
          setParkingZones(zones);
        } else {
          throw new Error("Invalid zone data structure");
        }
      }
      
      if (savedReservations) setParkingReservations(JSON.parse(savedReservations));
      if (savedRoutes) setTransportRoutes(JSON.parse(savedRoutes));
      if (savedJourneyPlans) setJourneyPlans(JSON.parse(savedJourneyPlans));
      if (savedRideBookings) setRideShareBookings(JSON.parse(savedRideBookings));
    } catch (error) {
      console.log("Error loading data from localStorage, reinitializing:", error);
      // Clear corrupted data
      localStorage.removeItem("parking.zones");
      localStorage.removeItem("transport.routes");
    }

    if (!savedZones || !savedRoutes) {
      initializeMockData();
    }

    // Auto-update availability and ETA every 5 seconds
    const interval = setInterval(() => {
      updateAvailabilityAndETA();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ============= UTILITY FUNCTIONS =============
  const updateAvailabilityAndETA = () => {
    setParkingZones(prev => prev.map(zone => {
      const randomChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const newAvailable = Math.max(0, Math.min(zone.total, zone.available + randomChange));
      const percentage = (newAvailable / zone.total) * 100;
      
      let status: "Available" | "Filling" | "Full" = "Available";
      if (percentage === 0) status = "Full";
      else if (percentage < 20) status = "Filling";
      
      return { ...zone, available: newAvailable, status };
    }));

    setTransportRoutes(prev => prev.map(route => {
      const newEta = Math.max(1, route.eta + (Math.random() > 0.5 ? -1 : 1));
      const occupancyChange = Math.floor(Math.random() * 3) - 1;
      const newOccupied = Math.max(0, Math.min(route.capacity, route.occupied + occupancyChange));
      
      let status: "Board Now" | "Wait for Next" | "Crowded" = "Board Now";
      const occupancyRate = newOccupied / route.capacity;
      if (occupancyRate > 0.8) status = "Crowded";
      else if (newEta > 10) status = "Wait for Next";
      
      return { ...route, eta: newEta, occupied: newOccupied, status };
    }));
  };

  const calculateParkingPrice = (zone: ParkingZone, duration: number) => {
    if (!zone.pricing || !zone.pricing.hourly) return 0;
    const demandFactor = 1 + (1 - zone.available / zone.total) * 0.5; // Higher demand = higher price
    const timeOfDayFactor = new Date().getHours() > 18 || new Date().getHours() < 8 ? 1.2 : 1; // Night premium
    return Math.ceil(zone.pricing.hourly * duration * demandFactor * timeOfDayFactor);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": case "Board Now": return "bg-green-500";
      case "Filling": case "Wait for Next": return "bg-yellow-500";
      case "Full": case "Crowded": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Available": return t.dashboard.status.available;
      case "Filling": return t.transport.status.filling;
      case "Full": return t.dashboard.status.full;
      case "Board Now": return t.transport.status.boardNow;
      case "Wait for Next": return t.transport.status.waitForNext;
      case "Crowded": return t.transport.status.crowded;
      case "Requested": return t.transport.status.requested;
      case "Confirmed": return t.transport.status.confirmed;
      case "En Route": return t.transport.status.enRoute;
      case "Completed": return t.transport.status.completed;
      default: return status;
    }
  };

  // ============= PARKING FUNCTIONS =============
  const handleParkingReservation = () => {
    if (!selectedZone || !reservationForm.vehicleNumber) {
      toast.error(t.transport.errors.fillAllFields);
      return;
    }

    const reservation: ParkingReservation = {
      id: `res_${Date.now()}`,
      zoneId: selectedZone.id,
      zoneName: selectedZone.name,
      vehicleNumber: reservationForm.vehicleNumber,
      duration: reservationForm.duration,
      slotNumber: `${selectedZone.name.charAt(0)}${Math.floor(Math.random() * 99) + 1}`,
      totalPrice: calculateParkingPrice(selectedZone, reservationForm.duration),
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

    toast.success("Reservation Confirmed!");
    setSelectedZone(null);
    setReservationForm({ vehicleNumber: "", duration: 2, slotPreference: "any" });
  };

  // ============= JOURNEY PLANNER FUNCTIONS =============
  const handleJourneyPlan = () => {
    if (!journeyForm.from || !journeyForm.to) {
      toast.error("Please fill origin and destination");
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

    toast.success("Journey planned successfully!");
    setJourneyForm({ from: "", to: "", preferredTime: "" });
  };

  // ============= RIDE SHARING FUNCTIONS =============
  const handleRideShareBooking = () => {
    if (!rideShareForm.from || !rideShareForm.to) {
      toast.error("Please fill pickup and destination");
      return;
    }

    const booking: RideShareBooking = {
      id: `ride_${Date.now()}`,
      type: rideShareForm.isEmergency ? "emergency" : "ride",
      from: rideShareForm.from,
      to: rideShareForm.to,
      passengers: rideShareForm.passengers,
      estimatedFare: Math.floor(Math.random() * 100) + 50,
      estimatedTime: `${Math.floor(Math.random() * 10) + 5} min`,
      status: "Requested",
      timestamp: new Date().toISOString()
    };

    const updatedBookings = [...rideShareBookings, booking];
    setRideShareBookings(updatedBookings);
    localStorage.setItem("rideshare.bookings", JSON.stringify(updatedBookings));

    toast.success(rideShareForm.isEmergency ? "Emergency ride requested!" : "Ride booked successfully!");
    setRideShareForm({ from: "", to: "", passengers: 1, isEmergency: false, contactNumber: "", description: "" });
  };

  const resetDemoData = () => {
    localStorage.removeItem("parking.zones");
    localStorage.removeItem("parking.reservations");
    localStorage.removeItem("transport.routes");
    localStorage.removeItem("transport.journeyPlan");
    localStorage.removeItem("rideshare.bookings");
    
    setParkingReservations([]);
    setJourneyPlans([]);
    setRideShareBookings([]);
    initializeMockData();
    
    toast.success("Demo data reset successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚌 {t.transport.intelligence}</h1>
          <p className="text-gray-600 mb-4">{t.transport.smartMobility}</p>
          <Button onClick={resetDemoData} variant="outline" className="mb-6">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.transport.resetDemo}
          </Button>
        </div>

        {/* Main Accordion */}
        <Accordion type="multiple" className="space-y-4">
          
          {/* ============= SMART PARKING SECTION ============= */}
          <AccordionItem value="parking" className="border rounded-2xl bg-white shadow-lg">
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900 hover:no-underline">
              <div className="flex items-center space-x-3">
                <Car className="w-6 h-6 text-blue-600" />
                <span>{t.transport.parkingManagement}</span>
                <Badge variant="secondary">{parkingZones.filter(z => z.status === "Available").length} {t.transport.available}</Badge>
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
                        <Badge className={`${getStatusColor(zone.status)} text-white`}>
                          {getStatusText(zone.status)}
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
                            <span>₹{zone.pricing?.hourly || 0}/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current Rate:</span>
                            <span>₹{calculateParkingPrice(zone, 1)}/hr</span>
                          </div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full" 
                              disabled={zone.status === "Full"}
                              onClick={() => setSelectedZone(zone)}
                            >
                              {zone.status === "Full" ? t.transport.full : t.transport.reserveSpace}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>{t.transport.reserveParking} - {selectedZone?.name}</DialogTitle>
                              <DialogDescription>
                                Complete your parking reservation
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="vehicle">Vehicle Number</Label>
                                <Input
                                  id="vehicle"
                                  placeholder={t.transport.vehicleNumberPlaceholder}
                                  value={reservationForm.vehicleNumber}
                                  onChange={(e) => setReservationForm({...reservationForm, vehicleNumber: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="duration">{t.transport.duration}</Label>
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
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Total Cost:</span>
                                    <span className="text-lg font-bold text-blue-600">
                                      ₹{calculateParkingPrice(selectedZone, reservationForm.duration)}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Dynamic pricing based on demand & time
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

              {/* Active Reservations */}
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
                              <p className="text-sm text-gray-600">Slot: {reservation.slotNumber}</p>
                              <p className="text-sm text-gray-600">Vehicle: {reservation.vehicleNumber}</p>
                              <p className="text-sm text-gray-600">Duration: {reservation.duration} hours</p>
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

          {/* ============= PUBLIC TRANSPORT SECTION ============= */}
          <AccordionItem value="transport" className="border rounded-2xl bg-white shadow-lg">
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900 hover:no-underline">
              <div className="flex items-center space-x-3">
                <Bus className="w-6 h-6 text-green-600" />
                <span>{t.transport.publicTransport}</span>
                <Badge variant="secondary">{transportRoutes.filter(r => r.status === "Board Now").length} {t.transport.readyToBoard}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              
              {/* Transport Routes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {transportRoutes.map((route) => (
                  <Card key={route.id} className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {route.mode === "Bus" && <Bus className="w-5 h-5 text-blue-600" />}
                          {route.mode === "Train" && <Train className="w-5 h-5 text-green-600" />}
                          {route.mode === "Shuttle" && <Car className="w-5 h-5 text-purple-600" />}
                          <CardTitle className="text-lg">{route.routeName}</CardTitle>
                        </div>
                        <Badge className={`${getStatusColor(route.status)} text-white`}>
                          {getStatusText(route.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {t.transport.eta}: {route.eta} min
                          </div>
                          <div>
                            {route.departureTime} → {route.arrivalTime}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{t.transport.capacity}</span>
                            <span>{route.occupied}/{route.capacity}</span>
                          </div>
                          <Progress value={(route.occupied / route.capacity) * 100} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{route.destination}</span>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {route.isFree ? "Free" : `₹${route.price}`}
                          </div>
                        </div>
                        
                        <Button className="w-full" disabled={route.status === "Crowded"}>
                          {route.status === "Crowded" ? "Too Crowded" : "Track Route"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Ceremony Timeline */}
              <Card className="rounded-2xl mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Ceremony Timeline & Transport Sync
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ceremonyEvents.map((event, index) => (
                      <div key={event.id} className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full ${event.status === "Completed" ? "bg-green-500" : event.status === "Ongoing" ? "bg-yellow-500" : "bg-gray-300"}`} />
                          {index < ceremonyEvents.length - 1 && <div className="w-0.5 h-8 bg-gray-300 mt-2" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{event.name}</h4>
                              <p className="text-sm text-gray-600">{event.location} • {event.time}</p>
                            </div>
                            <Badge variant={event.status === "Upcoming" ? "default" : "secondary"}>
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Journey Planner */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Navigation className="w-5 h-5 mr-2" />
                    {t.transport.journeyPlanner}
                  </CardTitle>
                  <CardDescription>{t.transport.journeyPlannerDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="from">{t.transport.from}</Label>
                      <Input
                        id="from"
                        placeholder={t.transport.journeyFromPlaceholder}
                        value={journeyForm.from}
                        onChange={(e) => setJourneyForm({...journeyForm, from: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="to">{t.transport.to}</Label>
                      <Input
                        id="to"
                        placeholder={t.transport.journeyToPlaceholder}
                        value={journeyForm.to}
                        onChange={(e) => setJourneyForm({...journeyForm, to: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Preferred Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={journeyForm.preferredTime}
                        onChange={(e) => setJourneyForm({...journeyForm, preferredTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={handleJourneyPlan} className="w-full mb-4">
                    Plan Journey
                  </Button>
                  
                  {/* Journey Plans */}
                  {journeyPlans.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Your Journey Plans</h4>
                      {journeyPlans.slice(-2).map((plan) => (
                        <div key={plan.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium">{plan.from} → {plan.to}</h5>
                              <p className="text-sm text-gray-600">Preferred: {plan.preferredTime}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">₹{plan.route.totalCost}</div>
                              <div className="text-sm text-gray-600">{plan.route.totalDuration}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {plan.route.steps.map((step, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium">{step.mode}:</span> {step.description}
                                </div>
                                <div className="text-gray-600">{step.duration}</div>
                                <div className="text-green-600 font-medium">₹{step.cost}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* ============= RIDE SHARING SECTION ============= */}
          <AccordionItem value="rideshare" className="border rounded-2xl bg-white shadow-lg">
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900 hover:no-underline">
              <div className="flex items-center space-x-3">
                <Share2 className="w-6 h-6 text-orange-600" />
                <span>{t.transport.rideshare}</span>
                <Badge variant="secondary">{rideShareBookings.filter(b => b.status === "Requested").length} Active</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              
              {/* Ride Booking Form */}
              <Card className="rounded-2xl mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    {t.transport.bookRide}
                  </CardTitle>
                  <CardDescription>{t.transport.smartMobility}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="pickup">{t.transport.pickupLocation}</Label>
                      <Input
                        id="pickup"
                        placeholder={t.transport.pickupLocationPlaceholder}
                        value={rideShareForm.from}
                        onChange={(e) => setRideShareForm({...rideShareForm, from: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="destination">{t.transport.destination}</Label>
                      <Input
                        id="destination"
                        placeholder={t.transport.destinationPlaceholder}
                        value={rideShareForm.to}
                        onChange={(e) => setRideShareForm({...rideShareForm, to: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="passengers">{t.transport.passengers}</Label>
                      <Select value={rideShareForm.passengers.toString()} onValueChange={(value) => setRideShareForm({...rideShareForm, passengers: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{t.transport.passengerOptions.one}</SelectItem>
                          <SelectItem value="2">{t.transport.passengerOptions.two}</SelectItem>
                          <SelectItem value="3">{t.transport.passengerOptions.three}</SelectItem>
                          <SelectItem value="4">{t.transport.passengerOptions.four}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="contact">{t.transport.contactNumber}</Label>
                      <Input
                        id="contact"
                        placeholder={t.transport.contactPlaceholder}
                        value={rideShareForm.contactNumber}
                        onChange={(e) => setRideShareForm({...rideShareForm, contactNumber: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="description">{t.transport.specialInstructions}</Label>
                    <Textarea
                      id="description"
                      placeholder={t.transport.instructionsPlaceholder}
                      value={rideShareForm.description}
                      onChange={(e) => setRideShareForm({...rideShareForm, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button 
                      onClick={() => {
                        setRideShareForm({...rideShareForm, isEmergency: false});
                        handleRideShareBooking();
                      }}
                      className="flex-1"
                    >
                      <Car className="w-4 h-4 mr-2" />
                      {t.transport.bookRide}
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setRideShareForm({...rideShareForm, isEmergency: true});
                        handleRideShareBooking();
                      }}
                      className="flex-1"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {t.transport.emergencyRide}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Bookings */}
              {rideShareBookings.length > 0 && (
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Share2 className="w-5 h-5 mr-2" />
                      {t.transport.yourRideBookings}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rideShareBookings.slice(-3).map((booking) => (
                        <div key={booking.id} className={`p-4 rounded-lg border-2 ${booking.type === "emergency" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{booking.from} → {booking.to}</h4>
                                {booking.type === "emergency" && (
                                  <Badge variant="destructive">Emergency</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {booking.passengers} passenger{booking.passengers > 1 ? "s" : ""}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center text-sm">
                                  <Clock className="w-4 h-4 mr-1" />
                                  ETA: {booking.estimatedTime}
                                </div>
                                <div className="flex items-center text-sm">
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  ₹{booking.estimatedFare}
                                </div>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(booking.status)} text-white`}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </div>
                          
                          {booking.driverInfo && (
                            <div className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="font-medium">{booking.driverInfo.name}</h5>
                                  <p className="text-sm text-gray-600">{booking.driverInfo.vehicle}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">⭐ {booking.driverInfo.rating}</span>
                                  <Button size="sm" variant="outline">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {t.transport.call}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default TransportIntelligence;
