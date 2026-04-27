import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Plane,
  MapPin,
  Battery,
  Send,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Trash2
} from "lucide-react";

interface DroneData {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  battery: number;
  status: 'active' | 'inactive' | 'maintenance' | 'dispatched';
  lastUpdate: string;
  assignedZone?: string;
  mission?: string;
}

const DroneManagement = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [drones, setDrones] = useState<DroneData[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<DroneData | null>(null);
  const [dispatchCoords, setDispatchCoords] = useState({ lat: '', lng: '' });
  const [mission, setMission] = useState('');
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [isAddDroneDialogOpen, setIsAddDroneDialogOpen] = useState(false);
  const [newDrone, setNewDrone] = useState({
    id: '',
    name: '',
    lat: '',
    lng: '',
    battery: '',
    status: 'inactive' as DroneData['status'],
    mission: ''
  });
  const { toast } = useToast();

  // Ujjain bounding box coordinates
  const ujjainBounds: [number, number, number, number] = [
    75.740123, 23.114581, // Southwest coordinates
    75.876777, 23.220746  // Northeast coordinates
  ];

  // Initialize map and drone data
  useEffect(() => {
    const initializeDrones = () => {
      const savedDrones = localStorage.getItem('kumbh_drones');
      if (savedDrones) {
        setDrones(JSON.parse(savedDrones));
      } else {
        const mockDrones: DroneData[] = [
          {
            id: 'DR001',
            name: 'Sky Guardian Alpha',
            coordinates: { lat: 23.1765, lng: 75.7885 },
            battery: 85,
            status: 'active',
            lastUpdate: new Date().toISOString(),
            assignedZone: 'Main Ghat Area',
            mission: 'Crowd Monitoring'
          },
          {
            id: 'DR002',
            name: 'Aerial Scout Beta',
            coordinates: { lat: 23.1785, lng: 75.7905 },
            battery: 72,
            status: 'active',
            lastUpdate: new Date().toISOString(),
            assignedZone: 'Transport Hub',
            mission: 'Traffic Surveillance'
          },
          {
            id: 'DR003',
            name: 'Night Watcher Gamma',
            coordinates: { lat: 23.1745, lng: 75.7865 },
            battery: 45,
            status: 'inactive',
            lastUpdate: new Date().toISOString(),
            assignedZone: 'Security Perimeter'
          },
          {
            id: 'DR004',
            name: 'Emergency Response Delta',
            coordinates: { lat: 23.1805, lng: 75.7925 },
            battery: 90,
            status: 'dispatched',
            lastUpdate: new Date().toISOString(),
            assignedZone: 'Medical Zone',
            mission: 'Emergency Response'
          },
          {
            id: 'DR005',
            name: 'Patrol Eagle Epsilon',
            coordinates: { lat: 23.1725, lng: 75.7845 },
            battery: 15,
            status: 'maintenance',
            lastUpdate: new Date().toISOString(),
            assignedZone: 'Maintenance Dock'
          }
        ];
        setDrones(mockDrones);
        localStorage.setItem('kumbh_drones', JSON.stringify(mockDrones));
      }
    };

    // Initialize MapLibre GL JS map
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/streets/style.json?key=5jykIBLfECbVwrj8kR6L',
        center: [75.7885, 23.1765], // Ujjain coordinates
        zoom: 13,
        maxBounds: ujjainBounds // Restrict map bounds to Ujjain
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Add drone data source
        map.current.addSource('drone-data', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        // Load drone icon
        const droneIconUrl = "https://cdn-icons-png.freepik.com/128/6186/6186982.png";

        map.current.loadImage(droneIconUrl)
          .then((image) => {
            if (!map.current) return;

            if (!map.current.hasImage('drone-icon')) {
              map.current.addImage('drone-icon', image.data);
            }

            // Add drone points layer
            map.current.addLayer({
              id: 'drone-points',
              type: 'symbol',
              source: 'drone-data',
              layout: {
                'icon-image': 'drone-icon',
                'icon-size': 0.3,
                'icon-allow-overlap': true
              }
            });

            // Add click handler for drone icons
            map.current.on('click', 'drone-points', (e) => {
              if (!e.features || !e.features[0]) return;

              const feature = e.features[0];
              const properties = feature.properties;

              new maplibregl.Popup()
                .setLngLat([properties.lng, properties.lat])
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-bold">${properties.id}</h3>
                    <p class="text-sm">${properties.name}</p>
                    <p class="text-sm">Status: <span class="font-medium">${properties.status}</span></p>
                    <p class="text-sm">Battery: <span class="font-medium">${properties.battery}%</span></p>
                    ${properties.mission ? `<p class="text-sm">Mission: <span class="font-medium">${properties.mission}</span></p>` : ''}
                  </div>
                `)
                .addTo(map.current!);
            });

            // Change cursor on hover
            map.current.on('mouseenter', 'drone-points', () => {
              if (map.current) map.current.getCanvas().style.cursor = 'pointer';
            });

            map.current.on('mouseleave', 'drone-points', () => {
              if (map.current) map.current.getCanvas().style.cursor = '';
            });
          })
          .catch((err) => {
            console.error("Error loading drone icon:", err);
          });
      });
    }

    initializeDrones();

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map when drones change - only show active drones
  useEffect(() => {
    if (map.current && map.current.getSource('drone-data')) {
      // Filter to only show active drones on the map
      const activeDrones = drones.filter(drone => drone.status === 'active' || drone.status === 'dispatched');

      const geoJsonData = {
        type: 'FeatureCollection' as const,
        features: activeDrones.map(drone => ({
          type: 'Feature' as const,
          properties: {
            id: drone.id,
            name: drone.name,
            status: drone.status,
            battery: drone.battery,
            mission: drone.mission || '',
            lat: drone.coordinates.lat,
            lng: drone.coordinates.lng
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [drone.coordinates.lng, drone.coordinates.lat]
          }
        }))
      };

      (map.current.getSource('drone-data') as maplibregl.GeoJSONSource).setData(geoJsonData);
    }
  }, [drones]);

  const updateDroneStatus = (droneId: string, newStatus: DroneData['status']) => {
    const updatedDrones = drones.map(drone =>
      drone.id === droneId
        ? { ...drone, status: newStatus, lastUpdate: new Date().toISOString() }
        : drone
    );
    setDrones(updatedDrones);
    localStorage.setItem('kumbh_drones', JSON.stringify(updatedDrones));

    toast({
      title: "Drone Status Updated",
      description: `Drone ${droneId} status changed to ${newStatus}`,
    });
  };

  const dispatchDrone = () => {
    if (!selectedDrone || !dispatchCoords.lat || !dispatchCoords.lng) {
      toast({
        title: "Invalid Dispatch",
        description: "Please provide valid coordinates",
        variant: "destructive"
      });
      return;
    }

    const updatedDrones = drones.map(drone =>
      drone.id === selectedDrone.id
        ? {
          ...drone,
          status: 'dispatched' as const,
          coordinates: {
            lat: parseFloat(dispatchCoords.lat),
            lng: parseFloat(dispatchCoords.lng)
          },
          mission: mission || 'Custom Mission',
          lastUpdate: new Date().toISOString()
        }
        : drone
    );

    setDrones(updatedDrones);
    localStorage.setItem('kumbh_drones', JSON.stringify(updatedDrones));

    toast({
      title: "Drone Dispatched",
      description: `${selectedDrone.name} dispatched to coordinates (${dispatchCoords.lat}, ${dispatchCoords.lng})`,
    });

    setIsDispatchDialogOpen(false);
    setDispatchCoords({ lat: '', lng: '' });
    setMission('');
  };

  const addNewDrone = () => {
    if (!newDrone.id || !newDrone.name || !newDrone.lat || !newDrone.lng || !newDrone.battery) {
      toast({
        title: "Invalid Drone Data",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Check if drone ID already exists
    if (drones.some(drone => drone.id === newDrone.id)) {
      toast({
        title: "Duplicate Drone ID",
        description: "A drone with this ID already exists",
        variant: "destructive"
      });
      return;
    }

    const droneToAdd: DroneData = {
      id: newDrone.id,
      name: newDrone.name,
      coordinates: {
        lat: parseFloat(newDrone.lat),
        lng: parseFloat(newDrone.lng)
      },
      battery: parseInt(newDrone.battery),
      status: newDrone.status,
      lastUpdate: new Date().toISOString(),
      mission: newDrone.mission || undefined
    };

    const updatedDrones = [...drones, droneToAdd];
    setDrones(updatedDrones);
    localStorage.setItem('kumbh_drones', JSON.stringify(updatedDrones));

    toast({
      title: "Drone Added",
      description: `${newDrone.name} (${newDrone.id}) has been added to the fleet`,
    });

    // Reset form
    setNewDrone({
      id: '',
      name: '',
      lat: '',
      lng: '',
      battery: '',
      status: 'inactive',
      mission: ''
    });
    setIsAddDroneDialogOpen(false);
  };

  const focusOnDrone = (drone: DroneData) => {
    if (map.current) {
      map.current.flyTo({
        center: [drone.coordinates.lng, drone.coordinates.lat],
        zoom: 16,
        duration: 1000
      });
    }
  };

  const removeDrone = (droneId: string) => {
    const updatedDrones = drones.filter(drone => drone.id !== droneId);
    setDrones(updatedDrones);
    localStorage.setItem('kumbh_drones', JSON.stringify(updatedDrones));

    toast({
      title: "Drone Removed",
      description: `Drone ${droneId} has been removed from the fleet`,
    });
  };

  const getStatusIcon = (status: DroneData['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'dispatched':
        return <Send className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-500';
    if (battery > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const activeDrones = drones.filter(drone => drone.status === 'active' || drone.status === 'dispatched');

  return (
    <div className="space-y-6">
      {/* Drone Map Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Drone Location Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapContainer}
            className="w-full h-[400px] rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Drone Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drone List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Drone Fleet ({drones.length})
                </span>
                <div className="flex gap-2">
                  <Dialog open={isAddDroneDialogOpen} onOpenChange={setIsAddDroneDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Drone
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Drone</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="drone-id">Drone ID *</Label>
                            <Input
                              id="drone-id"
                              placeholder="DR006"
                              value={newDrone.id}
                              onChange={(e) => setNewDrone(prev => ({ ...prev, id: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="drone-name">Name *</Label>
                            <Input
                              id="drone-name"
                              placeholder="Sky Patrol Zeta"
                              value={newDrone.name}
                              onChange={(e) => setNewDrone(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="drone-lat">Latitude *</Label>
                            <Input
                              id="drone-lat"
                              type="number"
                              step="0.000001"
                              placeholder="23.1765"
                              value={newDrone.lat}
                              onChange={(e) => setNewDrone(prev => ({ ...prev, lat: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="drone-lng">Longitude *</Label>
                            <Input
                              id="drone-lng"
                              type="number"
                              step="0.000001"
                              placeholder="75.7885"
                              value={newDrone.lng}
                              onChange={(e) => setNewDrone(prev => ({ ...prev, lng: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="drone-battery">Battery Level (%) *</Label>
                            <Input
                              id="drone-battery"
                              type="number"
                              min="0"
                              max="100"
                              placeholder="85"
                              value={newDrone.battery}
                              onChange={(e) => setNewDrone(prev => ({ ...prev, battery: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="drone-status">Status *</Label>
                            <Select
                              value={newDrone.status}
                              onValueChange={(value) => setNewDrone(prev => ({ ...prev, status: value as DroneData['status'] }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="dispatched">Dispatched</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="drone-mission">Mission (Optional)</Label>
                          <Input
                            id="drone-mission"
                            placeholder="Perimeter Patrol"
                            value={newDrone.mission}
                            onChange={(e) => setNewDrone(prev => ({ ...prev, mission: e.target.value }))}
                          />
                        </div>
                        <Button onClick={addNewDrone} className="w-full">
                          Add Drone to Fleet
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Simulate real-time updates
                      const updatedDrones = drones.map(drone => ({
                        ...drone,
                        lastUpdate: new Date().toISOString(),
                        battery: Math.max(10, drone.battery + Math.floor(Math.random() * 6) - 3)
                      }));
                      setDrones(updatedDrones);
                      localStorage.setItem('kumbh_drones', JSON.stringify(updatedDrones));
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drone ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drones.map((drone) => (
                      <TableRow key={drone.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{drone.id}</div>
                            <div className="text-sm text-muted-foreground">{drone.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              drone.status === 'active' ? 'default' :
                                drone.status === 'dispatched' ? 'secondary' :
                                  drone.status === 'maintenance' ? 'destructive' : 'outline'
                            }
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusIcon(drone.status)}
                            {drone.status.charAt(0).toUpperCase() + drone.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Battery className={`w-4 h-4 ${getBatteryColor(drone.battery)}`} />
                            <span className={getBatteryColor(drone.battery)}>
                              {drone.battery}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{drone.coordinates.lat.toFixed(4)}</div>
                            <div>{drone.coordinates.lng.toFixed(4)}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1 h-6 text-xs"
                              onClick={() => focusOnDrone(drone)}
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              Focus
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Dialog
                              open={isDispatchDialogOpen && selectedDrone?.id === drone.id}
                              onOpenChange={(open) => {
                                setIsDispatchDialogOpen(open);
                                if (open) setSelectedDrone(drone);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={drone.status === 'maintenance'}
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Dispatch
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Dispatch Drone {drone.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="lat">Latitude</Label>
                                      <Input
                                        id="lat"
                                        type="number"
                                        placeholder="23.1765"
                                        value={dispatchCoords.lat}
                                        onChange={(e) => setDispatchCoords(prev => ({ ...prev, lat: e.target.value }))}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="lng">Longitude</Label>
                                      <Input
                                        id="lng"
                                        type="number"
                                        placeholder="75.7885"
                                        value={dispatchCoords.lng}
                                        onChange={(e) => setDispatchCoords(prev => ({ ...prev, lng: e.target.value }))}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="mission">Mission Type</Label>
                                    <Select onValueChange={setMission}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select mission type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="crowd-monitoring">Crowd Monitoring</SelectItem>
                                        <SelectItem value="emergency-response">Emergency Response</SelectItem>
                                        <SelectItem value="traffic-surveillance">Traffic Surveillance</SelectItem>
                                        <SelectItem value="security-patrol">Security Patrol</SelectItem>
                                        <SelectItem value="custom">Custom Mission</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button onClick={dispatchDrone} className="w-full">
                                    Dispatch Drone
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Select onValueChange={(value) => updateDroneStatus(drone.id, value as DroneData['status'])}>
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeDrone(drone.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fleet Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {drones.filter(d => d.status === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {drones.filter(d => d.status === 'dispatched').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Dispatched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-500">
                    {drones.filter(d => d.status === 'inactive').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Inactive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {drones.filter(d => d.status === 'maintenance').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Maintenance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Battery Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {drones
                  .filter(drone => drone.battery < 30)
                  .map(drone => (
                    <div key={drone.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <span className="text-sm font-medium">{drone.id}</span>
                      <Badge variant="destructive">{drone.battery}%</Badge>
                    </div>
                  ))}
                {drones.filter(drone => drone.battery < 30).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    All drones have sufficient battery
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DroneManagement;
