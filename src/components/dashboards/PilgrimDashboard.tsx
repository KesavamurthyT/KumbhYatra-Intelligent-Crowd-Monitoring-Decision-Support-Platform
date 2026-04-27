import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import TransportBooking from "@/components/TransportBooking";

const PilgrimDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const quickActions = [
    { title: t.dashboard.generatePass, icon: "📱", description: "Create entry pass for sacred areas", action: () => navigate("/pass") },
    { title: t.dashboard.openMap, icon: "🗺️", description: "Navigate with crowd insights", action: () => navigate("/map") },
    { title: t.dashboard.emergencySOS, icon: "🆘", description: "Quick emergency assistance", action: () => navigate("/sos") },
    { title: t.dashboard.lostFound, icon: "🔍", description: "Report or find lost items", action: () => navigate("/lost-found") }
  ];

  const liveUpdates = [
    { type: "crowd", message: t.dashboard.crowdLow, time: "2 min ago", color: "text-forest" },
    { type: "weather", message: t.dashboard.weatherClear, time: "5 min ago", color: "text-river" },
    { type: "ceremony", message: t.dashboard.eveningAarti, time: "10 min ago", color: "text-saffron" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-sacred p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-poppins font-bold">🕉️ {t.dashboard.welcome}</h1>
            <p className="text-white/80">{t.dashboard.devotee}</p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => navigate("/profile")}
          >
            {t.navigation.profile}
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">{t.navigation.dashboard}</TabsTrigger>
            <TabsTrigger value="transport">{t.navigation.transport}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-poppins font-semibold mb-4">{t.dashboard.quickActions}</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Card key={index} className="cursor-pointer transition-sacred hover:shadow-saffron" onClick={action.action}>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{action.icon}</div>
                      <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Live Updates */}
            <section>
              <h2 className="text-xl font-poppins font-semibold mb-4">{t.dashboard.liveUpdates}</h2>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {liveUpdates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${update.color.replace('text-', 'bg-')}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{update.message}</p>
                          <p className="text-xs text-muted-foreground">{update.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Nearby Facilities */}
            <section>
              <h2 className="text-xl font-poppins font-semibold mb-4">{t.dashboard.nearbyFacilities}</h2>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {[
                      { name: "Har Ki Pauri Ghat", distance: "0.2 km", status: t.dashboard.status.open, queue: t.dashboard.queueLow },
                      { name: "Medical Center", distance: "0.5 km", status: "24/7", queue: "None" },
                      { name: "Food Court", distance: "0.3 km", status: t.dashboard.status.open, queue: t.dashboard.queueMedium }
                    ].map((facility, index) => (
                      <div key={index} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{facility.name}</p>
                          <p className="text-xs text-muted-foreground">{facility.distance} • Queue: {facility.queue}</p>
                        </div>
                        <span className="text-xs bg-forest/20 text-forest px-2 py-1 rounded-full">
                          {facility.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="transport" className="space-y-6">
            <TransportBooking />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PilgrimDashboard;