import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const VIPDashboard = () => {
  const navigate = useNavigate();

  const vipServices = [
    { title: "Concierge Chat", icon: "💬", description: "24/7 personal assistance", action: () => {} },
    { title: "Priority Booking", icon: "⭐", description: "Skip queues and book instantly", action: () => {} },
    { title: "Private Transport", icon: "🚗", description: "Dedicated vehicle service", action: () => {} },
    { title: "Exclusive Areas", icon: "🏛️", description: "Access VIP viewing areas", action: () => navigate("/map") }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-saffron p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-poppins font-bold">⭐ VIP Services</h1>
            <p className="text-white/80">Privileged Experience</p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => navigate("/profile")}
          >
            Profile
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* VIP Services */}
        <section>
          <h2 className="text-xl font-poppins font-semibold mb-4">VIP Services</h2>
          <div className="grid grid-cols-2 gap-4">
            {vipServices.map((service, index) => (
              <Card key={index} className="cursor-pointer transition-sacred hover:shadow-sacred" onClick={service.action}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{service.icon}</div>
                  <h3 className="font-medium text-sm mb-1">{service.title}</h3>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Active Bookings */}
        <section>
          <h2 className="text-xl font-poppins font-semibold mb-4">Active Bookings</h2>
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-muted-foreground">No active bookings</p>
                <Button className="mt-4 bg-temple hover:bg-temple-dark">
                  Make a Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default VIPDashboard;