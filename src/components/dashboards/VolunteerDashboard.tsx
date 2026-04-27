import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const VolunteerDashboard = () => {
  const navigate = useNavigate();

  const tasks = [
    { id: 1, title: "Guide pilgrims at Gate 3", priority: "High", location: "Main Entrance", time: "10:00 AM" },
    { id: 2, title: "Assist with crowd control", priority: "Medium", location: "Har Ki Pauri", time: "2:00 PM" },
    { id: 3, title: "Help with lost & found", priority: "Low", location: "Information Center", time: "4:00 PM" }
  ];

  const quickActions = [
    { title: "QR Scanner", icon: "📸", description: "Scan pilgrim passes", action: () => navigate("/scanner") },
    { title: "Report Incident", icon: "⚠️", description: "Submit incident report", action: () => {} },
    { title: "Chat Supervisor", icon: "💬", description: "Contact team lead", action: () => {} },
    { title: "Emergency", icon: "🆘", description: "Emergency assistance", action: () => navigate("/sos") }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-forest p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-poppins font-bold">🤝 Volunteer Hub</h1>
            <p className="text-white/80">Service with devotion</p>
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
        {/* Task Assignments */}
        <section>
          <h2 className="text-xl font-poppins font-semibold mb-4">Today's Tasks</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="transition-sacred hover:shadow-forest">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">{task.title}</h3>
                      <p className="text-xs text-muted-foreground">{task.location} • {task.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'High' ? 'bg-destructive/20 text-destructive' :
                      task.priority === 'Medium' ? 'bg-saffron/20 text-saffron' :
                      'bg-forest/20 text-forest'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" className="bg-forest hover:bg-forest-dark">
                      Start Task
                    </Button>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-poppins font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer transition-sacred hover:shadow-forest" onClick={action.action}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default VolunteerDashboard;