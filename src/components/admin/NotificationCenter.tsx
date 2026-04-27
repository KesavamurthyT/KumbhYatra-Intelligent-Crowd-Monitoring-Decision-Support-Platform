import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  MessageSquare, 
  Users, 
  MapPin, 
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Megaphone
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  zone: string;
  audience: 'all' | 'volunteers' | 'pilgrims';
  sentAt: string;
  sentBy: string;
  readCount: number;
  totalTargets: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  zones: string[];
  audience: 'all' | 'volunteers' | 'pilgrims';
  createdAt: string;
  isActive: boolean;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    zone: '',
    audience: 'all' as Notification['audience']
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium' as Announcement['priority'],
    zones: [] as string[],
    audience: 'all' as Announcement['audience']
  });
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const { toast } = useToast();

  const zones = [
    'All Zones',
    'Main Ghat Area', 
    'Transport Hub', 
    'Medical Zone', 
    'Security Perimeter', 
    'Information Center', 
    'Parking Area',
    'VIP Area',
    'Food Court'
  ];

  useEffect(() => {
    // Load notifications
    const savedNotifications = localStorage.getItem('kumbh_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      const mockNotifications: Notification[] = [
        {
          id: 'N001',
          title: 'Weather Alert',
          message: 'Heavy rainfall expected in the evening. Pilgrims advised to take shelter.',
          type: 'warning',
          zone: 'All Zones',
          audience: 'all',
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sentBy: 'Admin',
          readCount: 1247,
          totalTargets: 2500
        },
        {
          id: 'N002',
          title: 'Lost Child Found',
          message: 'A child found near Transport Hub has been safely reunited with family.',
          type: 'success',
          zone: 'Transport Hub',
          audience: 'all',
          sentAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          sentBy: 'Admin',
          readCount: 89,
          totalTargets: 150
        }
      ];
      setNotifications(mockNotifications);
      localStorage.setItem('kumbh_notifications', JSON.stringify(mockNotifications));
    }

    // Load announcements
    const savedAnnouncements = localStorage.getItem('kumbh_announcements');
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements));
    } else {
      const mockAnnouncements: Announcement[] = [
        {
          id: 'A001',
          title: 'Main Ghat Bathing Schedule',
          content: 'Sacred bathing hours: 4:00 AM - 6:00 AM and 5:00 PM - 7:00 PM. Please follow queue guidelines.',
          priority: 'high',
          zones: ['Main Ghat Area'],
          audience: 'pilgrims',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: 'A002',
          title: 'Volunteer Shift Update',
          content: 'Night shift volunteers report to coordination center by 8:00 PM for briefing.',
          priority: 'medium',
          zones: ['All Zones'],
          audience: 'volunteers',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ];
      setAnnouncements(mockAnnouncements);
      localStorage.setItem('kumbh_announcements', JSON.stringify(mockAnnouncements));
    }
  }, []);

  const sendBroadcast = () => {
    if (!newNotification.title.trim() || !newNotification.message.trim() || !newNotification.zone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Calculate target audience size (mocked)
    const getTargetSize = (zone: string, audience: string) => {
      const baseSize = zone === 'All Zones' ? 2500 : Math.floor(Math.random() * 500) + 100;
      const multiplier = audience === 'all' ? 1 : audience === 'pilgrims' ? 0.85 : 0.15;
      return Math.floor(baseSize * multiplier);
    };

    const notification: Notification = {
      id: `N${String(notifications.length + 1).padStart(3, '0')}`,
      title: newNotification.title.trim(),
      message: newNotification.message.trim(),
      type: newNotification.type,
      zone: newNotification.zone,
      audience: newNotification.audience,
      sentAt: new Date().toISOString(),
      sentBy: 'Admin',
      readCount: 0,
      totalTargets: getTargetSize(newNotification.zone, newNotification.audience)
    };

    const updatedNotifications = [notification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem('kumbh_notifications', JSON.stringify(updatedNotifications));

    // Simulate notification delivery
    setTimeout(() => {
      const deliveredNotification = {
        ...notification,
        readCount: Math.floor(notification.totalTargets * 0.75) + Math.floor(Math.random() * 50)
      };
      const updated = updatedNotifications.map(n => 
        n.id === notification.id ? deliveredNotification : n
      );
      setNotifications(updated);
      localStorage.setItem('kumbh_notifications', JSON.stringify(updated));
    }, 2000);

    toast({
      title: "Broadcast Sent",
      description: `Message sent to ${notification.totalTargets} ${notification.audience} in ${notification.zone}`,
    });

    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      zone: '',
      audience: 'all'
    });
    setIsBroadcastOpen(false);
  };

  const createAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim() || newAnnouncement.zones.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one zone",
        variant: "destructive"
      });
      return;
    }

    const announcement: Announcement = {
      id: `A${String(announcements.length + 1).padStart(3, '0')}`,
      title: newAnnouncement.title.trim(),
      content: newAnnouncement.content.trim(),
      priority: newAnnouncement.priority,
      zones: newAnnouncement.zones,
      audience: newAnnouncement.audience,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const updatedAnnouncements = [announcement, ...announcements];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('kumbh_announcements', JSON.stringify(updatedAnnouncements));

    toast({
      title: "Announcement Created",
      description: `Announcement posted to ${announcement.zones.join(', ')}`,
    });

    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'medium',
      zones: [],
      audience: 'all'
    });
    setIsAnnouncementOpen(false);
  };

  const toggleAnnouncementStatus = (id: string) => {
    const updatedAnnouncements = announcements.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('kumbh_announcements', JSON.stringify(updatedAnnouncements));

    toast({
      title: "Announcement Updated",
      description: "Announcement status has been changed",
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getNotificationBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'default';
      case 'warning': return 'secondary';
      case 'urgent': return 'destructive';
      case 'success': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="broadcast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="broadcast">Broadcast Messages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Broadcast Center
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Send instant messages to pilgrims and volunteers
                  </p>
                </div>
                <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Megaphone className="w-4 h-4 mr-2" />
                      Send Broadcast
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Send Broadcast Message</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Message Title</Label>
                        <Input
                          id="title"
                          value={newNotification.title}
                          onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter message title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message Content</Label>
                        <Textarea
                          id="message"
                          value={newNotification.message}
                          onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Enter your message"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Message Type</Label>
                          <Select onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value as Notification['type'] }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Information</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="success">Good News</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="audience">Target Audience</Label>
                          <Select onValueChange={(value) => setNewNotification(prev => ({ ...prev, audience: value as Notification['audience'] }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Everyone</SelectItem>
                              <SelectItem value="pilgrims">Pilgrims Only</SelectItem>
                              <SelectItem value="volunteers">Volunteers Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="zone">Target Zone</Label>
                        <Select onValueChange={(value) => setNewNotification(prev => ({ ...prev, zone: value }))}>
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
                      <Button onClick={sendBroadcast} className="w-full">
                        Send Broadcast
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No broadcasts sent yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <Card key={notification.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {getNotificationIcon(notification.type)}
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge variant={getNotificationBadgeVariant(notification.type)}>
                                {notification.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {notification.zone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {notification.audience}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(notification.sentAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {notification.readCount}/{notification.totalTargets}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round((notification.readCount / notification.totalTargets) * 100)}% read
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Announcements
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Create and manage public announcements
                  </p>
                </div>
                <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Create Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Announcement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ann-title">Announcement Title</Label>
                        <Input
                          id="ann-title"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter announcement title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ann-content">Content</Label>
                        <Textarea
                          id="ann-content"
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Enter announcement content"
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ann-priority">Priority</Label>
                          <Select onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, priority: value as Announcement['priority'] }))}>
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
                        <div>
                          <Label htmlFor="ann-audience">Audience</Label>
                          <Select onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, audience: value as Announcement['audience'] }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Everyone</SelectItem>
                              <SelectItem value="pilgrims">Pilgrims Only</SelectItem>
                              <SelectItem value="volunteers">Volunteers Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Target Zones (select multiple)</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {zones.slice(1).map(zone => (
                            <label key={zone} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={newAnnouncement.zones.includes(zone)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewAnnouncement(prev => ({ 
                                      ...prev, 
                                      zones: [...prev.zones, zone] 
                                    }));
                                  } else {
                                    setNewAnnouncement(prev => ({ 
                                      ...prev, 
                                      zones: prev.zones.filter(z => z !== zone) 
                                    }));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{zone}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <Button onClick={createAnnouncement} className="w-full">
                        Create Announcement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No announcements created yet</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <Card key={announcement.id} className={`border-l-4 ${announcement.isActive ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{announcement.title}</h4>
                              <span className={`text-sm font-medium ${getPriorityColor(announcement.priority)}`}>
                                {announcement.priority.toUpperCase()}
                              </span>
                              <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                                {announcement.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {announcement.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {announcement.zones.join(', ')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {announcement.audience}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(announcement.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAnnouncementStatus(announcement.id)}
                          >
                            {announcement.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
