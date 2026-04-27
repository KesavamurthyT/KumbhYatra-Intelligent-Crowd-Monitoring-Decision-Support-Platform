import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Clock, MapPin, Users, Download, Trash2 } from "lucide-react";

interface Passenger {
  id: string;
  name: string;
  age: string;
  gender: string;
}

interface Ticket {
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

const MyTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    // Load tickets from localStorage
    const savedTickets = localStorage.getItem("myTickets");
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }
  }, []);

  const cancelTicket = (ticketId: string) => {
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: "Cancelled" as const }
        : ticket
    );
    
    setTickets(updatedTickets);
    localStorage.setItem("myTickets", JSON.stringify(updatedTickets));

    toast({
      title: "Ticket Cancelled",
      description: "Your ticket has been cancelled successfully",
    });
  };

  const downloadQR = (ticket: Ticket) => {
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

  const getStatusColor = (status: string) => {
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

  const upcomingTickets = tickets.filter(ticket => ticket.status === "Upcoming");
  const pastTickets = tickets.filter(ticket => ticket.status !== "Upcoming");

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <QrCode className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
          <p className="text-gray-600 text-center mb-4">
            You haven't booked any transport tickets yet.<br />
            Use the Transport tab to book your first ticket.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Tickets */}
      {upcomingTickets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Journeys ({upcomingTickets.length})</h2>
          <div className="space-y-4">
            {upcomingTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{ticket.routeName}</h3>
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
                        alt="QR Code" 
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
      {pastTickets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Tickets ({pastTickets.length})</h2>
          <div className="space-y-4">
            {pastTickets.map((ticket) => (
              <Card key={ticket.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{ticket.routeName}</h3>
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

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
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
                  alt="QR Code" 
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
    </div>
  );
};

export default MyTickets;
