import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Thermometer, 
  Eye, 
  Clock, 
  RotateCcw,
  Palette,
  TrendingUp,
  Users,
  AlertTriangle,
  Activity
} from "lucide-react";

interface HeatmapData {
  zone: string;
  density: number;
  capacity: number;
  timestamp: string;
  coordinates: { lat: number; lng: number; radius: number };
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface HeatmapSettings {
  opacity: number;
  intensity: number;
  radius: number;
  colorScheme: string;
  showLegend: boolean;
  autoUpdate: boolean;
  updateInterval: number; // in seconds
}

const CrowdHeatmapControls = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [settings, setSettings] = useState<HeatmapSettings>({
    opacity: 70,
    intensity: 80,
    radius: 50,
    colorScheme: 'thermal',
    showLegend: true,
    autoUpdate: true,
    updateInterval: 2
  });
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Generate time range only once on mount
  useEffect(() => {
    const generateTimeRange = () => {
      const times = [];
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        times.push(time.toISOString());
      }
      setTimeRange(times);
    };

    generateTimeRange();
  }, []); // Only run once on mount

  // Generate initial heatmap data
  useEffect(() => {
    const generateHeatmapData = (timeIndex: number = 0) => {
      const zones = [
        { name: 'Main Ghat Area', coords: { lat: 25.4358, lng: 81.8463, radius: 200 }, capacity: 5000 },
        { name: 'Transport Hub', coords: { lat: 25.4398, lng: 81.8503, radius: 150 }, capacity: 2000 },
        { name: 'Medical Zone', coords: { lat: 25.4318, lng: 81.8423, radius: 100 }, capacity: 500 },
        { name: 'Food Court', coords: { lat: 25.4378, lng: 81.8483, radius: 120 }, capacity: 1500 },
        { name: 'VIP Area', coords: { lat: 25.4338, lng: 81.8443, radius: 80 }, capacity: 300 },
        { name: 'Parking Area', coords: { lat: 25.4418, lng: 81.8523, radius: 180 }, capacity: 3000 }
      ];

      const baseTime = timeRange[timeIndex] || new Date().toISOString();
      const hour = new Date(baseTime).getHours();
      
      // Simulate crowd patterns based on time
      const getTimeMultiplier = (hour: number) => {
        if (hour >= 4 && hour <= 7) return 0.9; // Peak morning bathing
        if (hour >= 17 && hour <= 20) return 0.85; // Peak evening bathing
        if (hour >= 8 && hour <= 16) return 0.6; // Moderate day activity
        return 0.3; // Low night activity
      };

      const timeMultiplier = getTimeMultiplier(hour);
      const variation = Math.random() * 0.2 - 0.1; // ±10% random variation

      return zones.map(zone => {
        const baseDensity = Math.min(zone.capacity * (timeMultiplier + variation), zone.capacity);
        const density = Math.max(0, baseDensity + (Math.random() * 200 - 100));
        const percentage = (density / zone.capacity) * 100;
        
        let alertLevel: HeatmapData['alertLevel'] = 'low';
        if (percentage > 90) alertLevel = 'critical';
        else if (percentage > 75) alertLevel = 'high';
        else if (percentage > 50) alertLevel = 'medium';

        return {
          zone: zone.name,
          density: Math.round(density),
          capacity: zone.capacity,
          timestamp: baseTime,
          coordinates: zone.coords,
          alertLevel
        };
      });
    };

    if (timeRange.length > 0) {
      setHeatmapData(generateHeatmapData());
    }
  }, [timeRange]); // Only run when timeRange is initially set

  // Separate effect for auto-update interval to prevent multiple intervals
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const generateLiveHeatmapData = () => {
      const zones = [
        { name: 'Main Ghat Area', coords: { lat: 25.4358, lng: 81.8463, radius: 200 }, capacity: 5000 },
        { name: 'Transport Hub', coords: { lat: 25.4398, lng: 81.8503, radius: 150 }, capacity: 2000 },
        { name: 'Medical Zone', coords: { lat: 25.4318, lng: 81.8423, radius: 100 }, capacity: 500 },
        { name: 'Food Court', coords: { lat: 25.4378, lng: 81.8483, radius: 120 }, capacity: 1500 },
        { name: 'VIP Area', coords: { lat: 25.4338, lng: 81.8443, radius: 80 }, capacity: 300 },
        { name: 'Parking Area', coords: { lat: 25.4418, lng: 81.8523, radius: 180 }, capacity: 3000 }
      ];

      const baseTime = new Date().toISOString();
      const hour = new Date(baseTime).getHours();
      
      const getTimeMultiplier = (hour: number) => {
        if (hour >= 4 && hour <= 7) return 0.9;
        if (hour >= 17 && hour <= 20) return 0.85;
        if (hour >= 8 && hour <= 16) return 0.6;
        return 0.3;
      };

      const timeMultiplier = getTimeMultiplier(hour);
      const variation = Math.random() * 0.2 - 0.1;

      return zones.map(zone => {
        const baseDensity = Math.min(zone.capacity * (timeMultiplier + variation), zone.capacity);
        const density = Math.max(0, baseDensity + (Math.random() * 200 - 100));
        const percentage = (density / zone.capacity) * 100;
        
        let alertLevel: HeatmapData['alertLevel'] = 'low';
        if (percentage > 90) alertLevel = 'critical';
        else if (percentage > 75) alertLevel = 'high';
        else if (percentage > 50) alertLevel = 'medium';

        return {
          zone: zone.name,
          density: Math.round(density),
          capacity: zone.capacity,
          timestamp: baseTime,
          coordinates: zone.coords,
          alertLevel
        };
      });
    };

    if (settings.autoUpdate && isLive) {
      interval = setInterval(() => {
        setHeatmapData(generateLiveHeatmapData());
      }, settings.updateInterval * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [settings.autoUpdate, settings.updateInterval, isLive]); // Removed timeRange dependency

  // Time travel functionality
  useEffect(() => {
    if (!isLive && timeRange.length > 0) {
      const generateHistoricalData = () => {
        const zones = [
          { name: 'Main Ghat Area', coords: { lat: 25.4358, lng: 81.8463, radius: 200 }, capacity: 5000 },
          { name: 'Transport Hub', coords: { lat: 25.4398, lng: 81.8503, radius: 150 }, capacity: 2000 },
          { name: 'Medical Zone', coords: { lat: 25.4318, lng: 81.8423, radius: 100 }, capacity: 500 },
          { name: 'Food Court', coords: { lat: 25.4378, lng: 81.8483, radius: 120 }, capacity: 1500 },
          { name: 'VIP Area', coords: { lat: 25.4338, lng: 81.8443, radius: 80 }, capacity: 300 },
          { name: 'Parking Area', coords: { lat: 25.4418, lng: 81.8523, radius: 180 }, capacity: 3000 }
        ];

        const selectedTimestamp = timeRange[selectedTime];
        const hour = new Date(selectedTimestamp).getHours();
        
        const getTimeMultiplier = (hour: number) => {
          if (hour >= 4 && hour <= 7) return 0.9;
          if (hour >= 17 && hour <= 20) return 0.85;
          if (hour >= 8 && hour <= 16) return 0.6;
          return 0.3;
        };

        const timeMultiplier = getTimeMultiplier(hour);

        return zones.map(zone => {
          const density = Math.round(zone.capacity * timeMultiplier * (0.8 + Math.random() * 0.4));
          const percentage = (density / zone.capacity) * 100;
          
          let alertLevel: HeatmapData['alertLevel'] = 'low';
          if (percentage > 90) alertLevel = 'critical';
          else if (percentage > 75) alertLevel = 'high';
          else if (percentage > 50) alertLevel = 'medium';

          return {
            zone: zone.name,
            density,
            capacity: zone.capacity,
            timestamp: selectedTimestamp,
            coordinates: zone.coords,
            alertLevel
          };
        });
      };

      setHeatmapData(generateHistoricalData());
    }
  }, [selectedTime, isLive, timeRange]);

  const updateSetting = <K extends keyof HeatmapSettings>(key: K, value: HeatmapSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings({
      opacity: 70,
      intensity: 80,
      radius: 50,
      colorScheme: 'thermal',
      showLegend: true,
      autoUpdate: true,
      updateInterval: 2
    });
  };

  const getAlertColor = (level: HeatmapData['alertLevel']) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
    }
  };

  const getAlertBadgeVariant = (level: HeatmapData['alertLevel']) => {
    switch (level) {
      case 'critical': return 'destructive' as const;
      case 'high': return 'secondary' as const;
      case 'medium': return 'outline' as const;
      case 'low': return 'default' as const;
    }
  };

  const totalCrowdCount = heatmapData.reduce((sum, zone) => sum + zone.density, 0);
  const averageDensity = heatmapData.length > 0 ? Math.round(totalCrowdCount / heatmapData.length) : 0;
  const criticalZones = heatmapData.filter(zone => zone.alertLevel === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Live Heatmap Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              <CardTitle>Live Crowd Density Heatmap</CardTitle>
              {isLive && (
                <Badge variant="default" className="animate-pulse">
                  <Activity className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isLive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLive(true)}
              >
                Live View
              </Button>
              <Button
                variant={!isLive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLive(false)}
              >
                Historical
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mock Heatmap Display */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 mb-4 relative">
            <div className="absolute top-2 right-2 text-xs text-muted-foreground">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {heatmapData.map((zone, index) => (
                <div 
                  key={zone.zone}
                  className={`p-3 rounded-lg border-2 ${getAlertColor(zone.alertLevel)}`}
                  style={{
                    opacity: settings.opacity / 100,
                    transform: `scale(${0.8 + (zone.density / zone.capacity) * 0.4})`
                  }}
                >
                  <div className="text-sm font-medium">{zone.zone}</div>
                  <div className="text-lg font-bold">
                    {zone.density.toLocaleString()}
                  </div>
                  <div className="text-xs">
                    {Math.round((zone.density / zone.capacity) * 100)}% capacity
                  </div>
                  <Badge variant={getAlertBadgeVariant(zone.alertLevel)} className="mt-1">
                    {zone.alertLevel.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            {settings.showLegend && (
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Low (0-50%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Medium (51-75%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>High (76-90%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Critical (91-100%)</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCrowdCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Crowd</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{averageDensity.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Avg Density</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalZones}</div>
              <div className="text-sm text-muted-foreground">Critical Zones</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Travel Controls */}
      {!isLive && timeRange.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Travel Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Historical Time Point</Label>
              <div className="mt-2">
                <Slider
                  value={[selectedTime]}
                  onValueChange={(value) => setSelectedTime(value[0])}
                  max={timeRange.length - 1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>24h ago</span>
                <span className="font-medium">
                  {timeRange[selectedTime] && new Date(timeRange[selectedTime]).toLocaleString()}
                </span>
                <span>Now</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedTime(Math.max(0, selectedTime - 1))}
                disabled={selectedTime === 0}
              >
                Previous Hour
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedTime(Math.min(timeRange.length - 1, selectedTime + 1))}
                disabled={selectedTime === timeRange.length - 1}
              >
                Next Hour
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heatmap Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visual Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Opacity ({settings.opacity}%)</Label>
              <Slider
                value={[settings.opacity]}
                onValueChange={(value) => updateSetting('opacity', value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Intensity ({settings.intensity}%)</Label>
              <Slider
                value={[settings.intensity]}
                onValueChange={(value) => updateSetting('intensity', value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Heat Radius ({settings.radius}px)</Label>
              <Slider
                value={[settings.radius]}
                onValueChange={(value) => updateSetting('radius', value[0])}
                min={20}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="colorScheme">Color Scheme</Label>
              <Select 
                value={settings.colorScheme} 
                onValueChange={(value) => updateSetting('colorScheme', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Thermal (Blue → Red)</SelectItem>
                  <SelectItem value="rainbow">Rainbow Spectrum</SelectItem>
                  <SelectItem value="monochrome">Monochrome</SelectItem>
                  <SelectItem value="plasma">Plasma</SelectItem>
                  <SelectItem value="viridis">Viridis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showLegend">Show Legend</Label>
              <Switch
                id="showLegend"
                checked={settings.showLegend}
                onCheckedChange={(checked) => updateSetting('showLegend', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Update Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoUpdate">Auto Update</Label>
              <Switch
                id="autoUpdate"
                checked={settings.autoUpdate}
                onCheckedChange={(checked) => updateSetting('autoUpdate', checked)}
              />
            </div>

            <div>
              <Label>Update Interval ({settings.updateInterval}s)</Label>
              <Slider
                value={[settings.updateInterval]}
                onValueChange={(value) => updateSetting('updateInterval', value[0])}
                min={2}
                max={300}
                step={1}
                className="mt-2"
                disabled={!settings.autoUpdate}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={resetToDefaults}
                className="w-full flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  Save Preset
                </Button>
              </div>
            </div>

            {criticalZones > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Critical Alert</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  {criticalZones} zone{criticalZones > 1 ? 's' : ''} at critical capacity. 
                  Consider crowd control measures.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrowdHeatmapControls;
