import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  UserCheck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  LogOut,
  ClipboardList,
  IdCard,
  PlayCircle,
  PauseCircle,
  XCircle
} from "lucide-react";

interface Volunteer {
  id: string;
  name: string;
  contact: string;
  status: 'available' | 'assigned' | 'on-break' | 'offline';
  createdAt: string;
  currentTask?: string;
  zone?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  zone: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
  estimatedDuration: number;
}

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'resolved';
  reportedAt: string;
  assignedTo?: string;
}

const VolunteerDashboard = () => {
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [assignedIncidents, setAssignedIncidents] = useState<Incident[]>([]);
  const [showIdCard, setShowIdCard] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if volunteer is logged in
    const currentVolunteer = localStorage.getItem('kumbh-user');
    if (!currentVolunteer) {
      navigate('/auth/login');
      return;
    }

    const volunteerData = JSON.parse(currentVolunteer);
    setVolunteer(volunteerData);

    // Load assigned tasks
    const savedTasks = localStorage.getItem('kumbh_tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      const myTasks = tasks.filter((task: Task) => task.assignedTo === volunteerData.id);
      setAssignedTasks(myTasks);
    }

    // Load assigned incidents
    const savedIncidents = localStorage.getItem('kumbh_incidents');
    if (savedIncidents) {
      const incidents = JSON.parse(savedIncidents);
      const myIncidents = incidents.filter((incident: Incident) => incident.assignedTo === volunteerData.id);
      setAssignedIncidents(myIncidents);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kumbh-user');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    navigate('/auth/login');
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const savedTasks = localStorage.getItem('kumbh_tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      const updatedTasks = tasks.map((task: Task) => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
            }
          : task
      );
      localStorage.setItem('kumbh_tasks', JSON.stringify(updatedTasks));
      
      // Update local state
      const myTasks = updatedTasks.filter((task: Task) => task.assignedTo === volunteer?.id);
      setAssignedTasks(myTasks);

      // Update volunteer status if completing task
      if (newStatus === 'completed') {
        updateVolunteerStatus('available');
      }

      toast({
        title: "Task Updated",
        description: `Task marked as ${newStatus.replace('-', ' ')}`,
      });
    }
  };

  const updateIncidentStatus = (incidentId: string, newStatus: Incident['status']) => {
    const savedIncidents = localStorage.getItem('kumbh_incidents');
    if (savedIncidents) {
      const incidents = JSON.parse(savedIncidents);
      const updatedIncidents = incidents.map((incident: Incident) => 
        incident.id === incidentId ? { ...incident, status: newStatus } : incident
      );
      localStorage.setItem('kumbh_incidents', JSON.stringify(updatedIncidents));
      
      // Update local state
      const myIncidents = updatedIncidents.filter((incident: Incident) => incident.assignedTo === volunteer?.id);
      setAssignedIncidents(myIncidents);

      toast({
        title: "Incident Updated",
        description: `Incident marked as ${newStatus}`,
      });
    }
  };

  const updateVolunteerStatus = (newStatus: Volunteer['status']) => {
    if (!volunteer) return;

    const savedVolunteers = localStorage.getItem('kumbh_volunteers');
    if (savedVolunteers) {
      const volunteers = JSON.parse(savedVolunteers);
      const updatedVolunteers = volunteers.map((v: Volunteer) => 
        v.id === volunteer.id 
          ? { 
              ...v, 
              status: newStatus,
              currentTask: newStatus === 'available' ? undefined : v.currentTask
            }
          : v
      );
      localStorage.setItem('kumbh_volunteers', JSON.stringify(updatedVolunteers));
      
      // Update current volunteer data
      const updatedVolunteer = { ...volunteer, status: newStatus };
      setVolunteer(updatedVolunteer);
      localStorage.setItem('kumbh-user', JSON.stringify(updatedVolunteer));

      toast({
        title: "Status Updated",
        description: `Your status is now: ${newStatus.replace('-', ' ')}`,
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': case 'open': return 'default';
      case 'assigned': case 'in-progress': return 'secondary';
      case 'completed': case 'resolved': return 'outline';
      case 'on-break': case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!volunteer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading volunteer dashboard...</p>
        </div>
      </div>
    );
  }

  const activeTasks = assignedTasks.filter(task => task.status !== 'completed' && task.status !== 'cancelled');
  const activeIncidents = assignedIncidents.filter(incident => incident.status !== 'resolved');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Volunteer Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {volunteer.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={getStatusBadgeVariant(volunteer.status)}>
                {volunteer.status.replace('-', ' ').toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowIdCard(!showIdCard)}>
                <IdCard className="w-4 h-4 mr-2" />
                {showIdCard ? 'Hide' : 'Show'} ID
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* ID Card */}
        {showIdCard && (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">KumbhYatra Volunteer</h3>
                  <p className="text-lg">{volunteer.name}</p>
                  <p className="text-sm opacity-90">{volunteer.contact}</p>
                  <p className="text-sm opacity-90">Zone: {volunteer.zone || 'Not assigned'}</p>
                </div>
                <div className="text-center">
                  <div className="bg-white text-black px-4 py-2 rounded font-mono text-lg font-bold">
                    {volunteer.id}
                  </div>
                  <p className="text-xs mt-1">Volunteer ID</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Status Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={volunteer.status === 'available' ? 'default' : 'outline'}
                onClick={() => updateVolunteerStatus('available')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Available
              </Button>
              <Button 
                variant={volunteer.status === 'on-break' ? 'default' : 'outline'}
                onClick={() => updateVolunteerStatus('on-break')}
                className="flex items-center gap-2"
              >
                <PauseCircle className="w-4 h-4" />
                On Break
              </Button>
              <Button 
                variant={volunteer.status === 'offline' ? 'default' : 'outline'}
                onClick={() => updateVolunteerStatus('offline')}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Off Duty
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                My Tasks ({activeTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTasks.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active tasks assigned</p>
                  <p className="text-sm text-muted-foreground">Check back later or contact your coordinator</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTasks.map((task) => (
                    <Card key={task.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(task.status)}>
                              {task.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {task.zone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimatedDuration} min
                            </span>
                            <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {task.status === 'assigned' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateTaskStatus(task.id, 'in-progress')}
                                className="flex items-center gap-1"
                              >
                                <PlayCircle className="w-3 h-3" />
                                Start Task
                              </Button>
                            )}
                            {task.status === 'in-progress' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateTaskStatus(task.id, 'completed')}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Incidents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                My Incidents ({activeIncidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active incidents assigned</p>
                  <p className="text-sm text-muted-foreground">Stay alert for new incident reports</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeIncidents.map((incident) => (
                    <Card key={incident.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{incident.type}</h4>
                              <p className="text-sm text-muted-foreground">{incident.description}</p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(incident.status)}>
                              {incident.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {incident.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(incident.reportedAt).toLocaleTimeString()}
                            </span>
                            <span className={`font-medium ${getPriorityColor(incident.priority)}`}>
                              {incident.priority.toUpperCase()}
                            </span>
                          </div>

                          {incident.status === 'assigned' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Always report any emergency situations immediately to the coordination center. 
            Use the emergency hotline for urgent medical or security concerns.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
