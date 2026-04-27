import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Navigation,
  Layers,
  Zap,
  Clock,
  Star,
  Menu,
  X
} from "lucide-react";
import { facilities } from "@/data/mockData";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [showCrowdHeatmap, setShowCrowdHeatmap] = useState(true);
  const [showVolunteerHeatmap, setShowVolunteerHeatmap] = useState(true);
  const [showDronePoints, setShowDronePoints] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [routingMode, setRoutingMode] = useState<"fastest" | "crowd-aware">("crowd-aware");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLayerControls, setShowLayerControls] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Ujjain bounding box coordinates
  const ujjainBounds: [number, number, number, number] = [
    75.758282, 23.125501, // Southwest coordinates
    75.829323, 23.215331  // Northeast coordinates
  ];

  // Generate random points within Ujjain bounds
  const generateRandomPoints = (count: number, intensityField = 'intensity') => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const lng = ujjainBounds[0] + Math.random() * (ujjainBounds[2] - ujjainBounds[0]);
      const lat = ujjainBounds[1] + Math.random() * (ujjainBounds[3] - ujjainBounds[1]);
      points.push({
        type: 'Feature' as const,
        properties: {
          [intensityField]: Math.random()
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [lng, lat]
        }
      });
    }
    return {
      type: 'FeatureCollection' as const,
      features: points
    };
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layerId: string, visible: boolean) => {
    if (map.current && mapLoaded) {
      try {
        map.current.setLayoutProperty(
          layerId,
          'visibility',
          visible ? 'visible' : 'none'
        );
      } catch (error) {
        console.warn(`Could not toggle layer ${layerId}:`, error);
      }
    }
  };

  useEffect(() => {
    // Initialize MapLibre GL JS map
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/streets/style.json?key=5jykIBLfECbVwrj8kR6L',
        center: [75.7804, 23.1793], // Ujjain coordinates
        zoom: 14,
        maxBounds: ujjainBounds // Restrict map bounds to Ujjain
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Handle missing sprite images
        map.current.on('styleimagemissing', (e) => {
          const missingImageId = e.id;
          
          // Create a simple fallback image for missing sprites
          const size = 64;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext('2d');
          
          if (context) {
            // Create a simple colored square as fallback
            context.fillStyle = '#ff6b6b';
            context.fillRect(0, 0, size, size);
            context.fillStyle = '#ffffff';
            context.font = '24px Arial';
            context.textAlign = 'center';
            context.fillText('?', size/2, size/2 + 8);
            
            const imageData = context.getImageData(0, 0, size, size);
            if (!map.current?.hasImage(missingImageId)) {
              map.current?.addImage(missingImageId, imageData);
            }
          }
        });

        // Generate mock data
        const crowdData = generateRandomPoints(4000, 'density');
        const volunteerData = generateRandomPoints(100, 'activity');
        const droneData = generateRandomPoints(50, 'status');

        // Add crowd heatmap source and layer
        map.current.addSource('crowd-data', {
          type: 'geojson',
          data: crowdData
        });

        map.current.addLayer({
          id: 'crowd-heatmap',
          type: 'heatmap',
          source: 'crowd-data',
          paint: {
            'heatmap-weight': ['get', 'density'],
            'heatmap-intensity': 2,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 255, 0, 0)',
              0.2, 'rgb(144, 238, 144)',
              0.4, 'rgb(255, 255, 0)',
              0.6, 'rgb(255, 165, 0)',
              0.8, 'rgb(255, 69, 0)',
              1, 'rgb(178, 34, 34)'
            ],
            'heatmap-radius': 20,
            'heatmap-opacity': 0.5
          }
        });

        // Add volunteer data source
        map.current?.addSource('volunteer-data', {
          type: 'geojson',
          data: volunteerData
        });

        // Add drone points source and layer
        map.current.addSource('drone-data', {
          type: 'geojson',
          data: droneData
        });

        // Load icons and add layers
        const volunteerIconUrl = "https://cdn-icons-png.freepik.com/128/2453/2453507.png";
        const droneIconUrl = "https://cdn-icons-png.freepik.com/128/6186/6186982.png";

        Promise.all([
          map.current?.loadImage(volunteerIconUrl),
          map.current?.loadImage(droneIconUrl)
        ]).then(([volunteerImage, droneImage]) => {
          if (!map.current) return;

          // Add volunteer icon and layer
          if (volunteerImage && !map.current.hasImage('volunteer-icon')) {
            map.current.addImage('volunteer-icon', volunteerImage.data);
            map.current.addLayer({
              id: 'volunteer-points',
              type: 'symbol',
              source: 'volunteer-data',
              layout: {
                'icon-image': 'volunteer-icon',
                'icon-size': 0.20,
                'icon-allow-overlap': true
              }
            });
          }

          // Add drone icon and layer
          if (droneImage && !map.current.hasImage('drone-icon')) {
            map.current.addImage('drone-icon', droneImage.data);
            map.current.addLayer({
              id: 'drone-points',
              type: 'symbol',
              source: 'drone-data',
              layout: {
                'icon-image': 'drone-icon',
                'icon-size': 0.25,
                'icon-allow-overlap': true
              }
            });
          }

          // Set map as loaded after all layers are added
          setMapLoaded(true);
        }).catch((err) => {
          console.error("Error loading icons:", err);
          // Still set map as loaded even if icons fail
          setMapLoaded(true);
        });
      });
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapLoaded(false);
    };
  }, []);

  // Handle layer visibility changes
  useEffect(() => {
    if (mapLoaded) {
      toggleLayerVisibility('crowd-heatmap', showCrowdHeatmap);
    }
  }, [showCrowdHeatmap, mapLoaded]);

  useEffect(() => {
    if (mapLoaded) {
      toggleLayerVisibility('volunteer-points', showVolunteerHeatmap);
    }
  }, [showVolunteerHeatmap, mapLoaded]);

  useEffect(() => {
    if (mapLoaded) {
      toggleLayerVisibility('drone-points', showDronePoints);
    }
  }, [showDronePoints, mapLoaded]);

  const getFacilityIcon = (type: string) => {
    const icons = {
      temple: "🛕",
      medical: "🏥",
      water: "💧",
      food: "🍽️",
      vip: "⭐"
    };
    return icons[type as keyof typeof icons] || "📍";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-forest text-white";
      case "restricted": return "bg-saffron text-white";
      case "closed": return "bg-destructive text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Map Area */}
      <div className="flex-1 relative">
        <div
          ref={mapContainer}
          className="w-full h-full rounded-lg"
        />

        {/* Map Controls */}
        <div className="absolute top-4 left-4 space-y-2">
          {/* Toggle Button */}
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
            onClick={() => setShowLayerControls(!showLayerControls)}
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Collapsible Controls */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showLayerControls
            ? 'max-h-[500px] opacity-100 transform translate-y-0'
            : 'max-h-0 opacity-0 transform -translate-y-2'
            }`}>
            <Card className="w-48 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center">
                    <Layers className="w-4 h-4 mr-2" />
                    Map Layers
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowLayerControls(false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="crowd-heatmap" className="text-sm">Crowd Heatmap</Label>
                  <Switch
                    id="crowd-heatmap"
                    checked={showCrowdHeatmap}
                    onCheckedChange={setShowCrowdHeatmap}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="volunteer-heatmap" className="text-sm">Volunteer Heatmap</Label>
                  <Switch
                    id="volunteer-heatmap"
                    checked={showVolunteerHeatmap}
                    onCheckedChange={setShowVolunteerHeatmap}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="drone-points" className="text-sm">Drone Points</Label>
                  <Switch
                    id="drone-points"
                    checked={showDronePoints}
                    onCheckedChange={setShowDronePoints}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="facilities" className="text-sm">Facilities</Label>
                  <Switch
                    id="facilities"
                    checked={showFacilities}
                    onCheckedChange={setShowFacilities}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Routing Mode</Label>
                  <div className="space-y-1">
                    <Button
                      variant={routingMode === "fastest" ? "default" : "outline"}
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setRoutingMode("fastest")}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Fastest Route
                    </Button>
                    <Button
                      variant={routingMode === "crowd-aware" ? "default" : "outline"}
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setRoutingMode("crowd-aware")}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Crowd-Aware
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <div className="absolute top-4 right-4">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Facilities Sidebar */}
      <div className={`border-l border-border bg-background flex flex-col h-screen transition-all duration-300 ease-in-out ${showSidebar
        ? 'w-80 translate-x-0'
        : 'w-0 translate-x-full'
        } overflow-hidden`}>
        <div className="p-4 border-b border-border flex-shrink-0 min-w-80">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-poppins font-semibold">
              Nearby Facilities
            </h2>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setShowSidebar(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-w-80">
          <div className="space-y-3">
            {facilities.map((facility) => (
              <Card
                key={facility.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedFacility?.id === facility.id ? "ring-2 ring-saffron" : ""
                  }`}
                onClick={() => setSelectedFacility(facility)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getFacilityIcon(facility.type)}</span>
                      <div>
                        <h3 className="font-medium text-sm">{facility.name}</h3>
                        <p className="text-xs text-muted-foreground">{facility.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(facility.status)}>
                      {facility.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{facility.queueEstimate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-temple text-temple" />
                      <span>{facility.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {facility.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs px-1">
                        {amenity.replace('_', ' ')}
                      </Badge>
                    ))}
                    {facility.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-1">
                        +{facility.amenities.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Button size="sm" className="w-full mt-2" variant="outline">
                    <Navigation className="w-3 h-3 mr-1" />
                    Navigate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Layer Information */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Layer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showCrowdHeatmap && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Crowd Density</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-blue-400 via-yellow-300 to-red-500 rounded-full"></div>
                </div>
              )}
              {showVolunteerHeatmap && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Volunteer Activity</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-green-200 via-green-400 to-green-700 rounded-full"></div>
                </div>
              )}
              {showDronePoints && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Drone Locations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    <span className="text-xs">Active Surveillance</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Map;