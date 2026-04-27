import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlus, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserCheck,
  ClipboardList
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
  estimatedDuration: number; // in minutes
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

const VolunteerManagement = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isAddVolunteerOpen, setIsAddVolunteerOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({ name: '', contact: '' });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    zone: '',
    priority: 'medium' as Task['priority'],
    estimatedDuration: 60
  });
  const { toast } = useToast();

  // Generate unique volunteer ID
  const generateVolunteerId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'V';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Initialize data
  useEffect(() => {
    const initializeData = () => {
      // Load volunteers
      const savedVolunteers = localStorage.getItem('kumbh_volunteers');
      if (savedVolunteers) {
        setVolunteers(JSON.parse(savedVolunteers));
      } else {
        const mockVolunteers: Volunteer[] = [
          {
            id: 'V12A3B',
            name: 'Rajesh Kumar',
            contact: '+91 98765 43210',
            status: 'assigned',
            createdAt: new Date().toISOString(),
            currentTask: 'Crowd Control - Main Ghat',
            zone: 'Main Ghat Area'
          },
          {
            id: 'V45C6D',
            name: 'Priya Sharma',
            contact: '+91 87654 32109',
            status: 'available',
            createdAt: new Date().toISOString(),
            zone: 'Transport Hub'
          },
          {
            id: 'V78E9F',
            name: 'Amit Singh',
            contact: '+91 76543 21098',
            status: 'on-break',
            createdAt: new Date().toISOString(),
            zone: 'Medical Zone'
          }
        ];
        setVolunteers(mockVolunteers);
        localStorage.setItem('kumbh_volunteers', JSON.stringify(mockVolunteers));
      }

      // Load tasks
      const savedTasks = localStorage.getItem('kumbh_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        const mockTasks: Task[] = [
          {
            id: 'T001',
            title: 'Crowd Control - Main Ghat',
            description: 'Manage pilgrim flow at main bathing area',
            zone: 'Main Ghat Area',
            priority: 'high',
            status: 'in-progress',
            assignedTo: 'V12A3B',
            createdAt: new Date().toISOString(),
            estimatedDuration: 120
          },
          {
            id: 'T002',
            title: 'Lost & Found Assistance',
            description: 'Help pilgrims locate lost belongings',
            zone: 'Information Center',
            priority: 'medium',
            status: 'assigned',
            createdAt: new Date().toISOString(),
            estimatedDuration: 90
          }
        ];
        setTasks(mockTasks);
        localStorage.setItem('kumbh_tasks', JSON.stringify(mockTasks));
      }

      // Load incidents
      const savedIncidents = localStorage.getItem('kumbh_incidents');
      if (savedIncidents) {
        setIncidents(JSON.parse(savedIncidents));
      } else {
        const mockIncidents: Incident[] = [
          {
            id: 'I001',
            type: 'Medical Emergency',
            description: 'Pilgrim feeling dizzy near main ghat',
            location: 'Main Ghat - Section A',
            priority: 'urgent',
            status: 'open',
            reportedAt: new Date().toISOString()
          },
          {
            id: 'I002',
            type: 'Lost Person',
            description: 'Child separated from family',
            location: 'Transport Hub',
            priority: 'high',
            status: 'assigned',
            assignedTo: 'V45C6D',
            reportedAt: new Date().toISOString()
          }
        ];
        setIncidents(mockIncidents);
        localStorage.setItem('kumbh_incidents', JSON.stringify(mockIncidents));
      }
    };

    initializeData();
  }, []);

  const addVolunteer = () => {
    if (!newVolunteer.name.trim() || !newVolunteer.contact.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both name and contact information",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate contact
    if (volunteers.some(v => v.contact === newVolunteer.contact)) {
      toast({
        title: "Duplicate Contact",
        description: "A volunteer with this contact already exists",
        variant: "destructive"
      });
      return;
    }

    const volunteer: Volunteer = {
      id: generateVolunteerId(),
      name: newVolunteer.name.trim(),
      contact: newVolunteer.contact.trim(),
      status: 'available',
      createdAt: new Date().toISOString()
    };

    const updatedVolunteers = [...volunteers, volunteer];
    setVolunteers(updatedVolunteers);
    localStorage.setItem('kumbh_volunteers', JSON.stringify(updatedVolunteers));

    toast({
      title: "Volunteer Added",
      description: `${volunteer.name} added with ID: ${volunteer.id}`,
    });

    setNewVolunteer({ name: '', contact: '' });
    setIsAddVolunteerOpen(false);
  };

  const updateVolunteerStatus = (volunteerId: string, status: Volunteer['status']) => {
    const updatedVolunteers = volunteers.map(v => 
      v.id === volunteerId ? { ...v, status } : v
    );
    setVolunteers(updatedVolunteers);
    localStorage.setItem('kumbh_volunteers', JSON.stringify(updatedVolunteers));

    toast({
      title: "Status Updated",
      description: `Volunteer status changed to ${status}`,
    });
  };

  const assignTask = (taskId: string, volunteerId: string) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, assignedTo: volunteerId, status: 'assigned' as const } : t
    );
    const updatedVolunteers = volunteers.map(v => 
      v.id === volunteerId ? { 
        ...v, 
        status: 'assigned' as const, 
        currentTask: tasks.find(t => t.id === taskId)?.title 
      } : v
    );

    setTasks(updatedTasks);
    setVolunteers(updatedVolunteers);
    localStorage.setItem('kumbh_tasks', JSON.stringify(updatedTasks));
    localStorage.setItem('kumbh_volunteers', JSON.stringify(updatedVolunteers));

    toast({
      title: "Task Assigned",
      description: "Task has been assigned to volunteer",
    });
  };

  const assignIncident = (incidentId: string, volunteerId: string) => {
    const updatedIncidents = incidents.map(i => 
      i.id === incidentId ? { ...i, assignedTo: volunteerId, status: 'assigned' as const } : i
    );
    setIncidents(updatedIncidents);
    localStorage.setItem('kumbh_incidents', JSON.stringify(updatedIncidents));

    toast({
      title: "Incident Assigned",
      description: "Incident has been assigned to volunteer",
    });
  };

  const addTask = () => {
    if (!newTask.title.trim() || !newTask.zone.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide task title and zone",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: `T${String(tasks.length + 1).padStart(3, '0')}`,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      zone: newTask.zone,
      priority: newTask.priority,
      status: 'assigned',
      createdAt: new Date().toISOString(),
      estimatedDuration: newTask.estimatedDuration
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem('kumbh_tasks', JSON.stringify(updatedTasks));

    toast({
      title: "Task Created",
      description: `Task "${task.title}" has been created`,
    });

    setNewTask({
      title: '',
      description: '',
      zone: '',
      priority: 'medium',
      estimatedDuration: 60
    });
    setIsAddTaskOpen(false);
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

  const zones = ['Main Ghat Area', 'Transport Hub', 'Medical Zone', 'Security Perimeter', 'Information Center', 'Parking Area'];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="volunteers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="volunteers">Volunteers ({volunteers.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="incidents">Incidents ({incidents.filter(i => i.status !== 'resolved').length})</TabsTrigger>
        </TabsList>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Volunteer Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage volunteer registration and assignments
                  </p>
                </div>
                <Dialog open={isAddVolunteerOpen} onOpenChange={setIsAddVolunteerOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Volunteer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Volunteer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newVolunteer.name}
                          onChange={(e) => setNewVolunteer(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter volunteer name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact">Contact Number</Label>
                        <Input
                          id="contact"
                          value={newVolunteer.contact}
                          onChange={(e) => setNewVolunteer(prev => ({ ...prev, contact: e.target.value }))}
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <Button onClick={addVolunteer} className="w-full">
                        Add Volunteer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Task</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell>
                          <div className="font-mono text-sm font-medium">
                            {volunteer.id}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {volunteer.name}
                        </TableCell>
                        <TableCell>{volunteer.contact}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(volunteer.status)}>
                            {volunteer.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {volunteer.currentTask || (
                            <span className="text-muted-foreground">No assignment</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select 
                            onValueChange={(value) => updateVolunteerStatus(volunteer.id, value as Volunteer['status'])}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="on-break">On Break</SelectItem>
                              <SelectItem value="offline">Offline</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Task Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Create and assign tasks to volunteers
                  </p>
                </div>
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter task title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the task details"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zone">Zone</Label>
                          <Select onValueChange={(value) => setNewTask(prev => ({ ...prev, zone: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select zone" />
                            </SelectTrigger>
                            <SelectContent>
                              {zones.map(zone => (
                                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as Task['priority'] }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newTask.estimatedDuration}
                          onChange={(e) => setNewTask(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 60 }))}
                        />
                      </div>
                      <Button onClick={addTask} className="w-full">
                        Create Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-mono">{task.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {task.estimatedDuration} min
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{task.zone}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(task.status)}>
                            {task.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.assignedTo ? (
                            <span className="font-mono">{task.assignedTo}</span>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!task.assignedTo && (
                            <Select onValueChange={(value) => assignTask(task.id, value)}>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Assign" />
                              </SelectTrigger>
                              <SelectContent>
                                {volunteers
                                  .filter(v => v.status === 'available')
                                  .map(volunteer => (
                                    <SelectItem key={volunteer.id} value={volunteer.id}>
                                      {volunteer.id}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Incident Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track and assign incidents requiring volunteer attention
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Incident ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-mono">{incident.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{incident.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(incident.reportedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{incident.location}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${getPriorityColor(incident.priority)}`}>
                            {incident.priority.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(incident.status)}>
                            {incident.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {incident.assignedTo ? (
                            <span className="font-mono">{incident.assignedTo}</span>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {incident.status === 'open' && (
                            <Select onValueChange={(value) => assignIncident(incident.id, value)}>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Assign" />
                              </SelectTrigger>
                              <SelectContent>
                                {volunteers
                                  .filter(v => v.status === 'available')
                                  .map(volunteer => (
                                    <SelectItem key={volunteer.id} value={volunteer.id}>
                                      {volunteer.id}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VolunteerManagement;
