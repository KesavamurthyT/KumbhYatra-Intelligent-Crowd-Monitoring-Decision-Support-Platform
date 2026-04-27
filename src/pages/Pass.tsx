import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Plus, Clock, CheckCircle, XCircle, Download, Share, MapPin, X } from "lucide-react";
import { generateQRPass, QRPassData } from "@/utils/qrUtils";
import { useToast } from "@/hooks/use-toast";
import LocationInput from "@/components/LocationInput";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { UserLocation } from "@/utils/locationUtils";
import { allocateGate, canAllocateGate } from "@/utils/allocationUtils";
import { hasAvailabilityForSlot } from "@/utils/gateUtils";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useTranslation } from "@/hooks/useTranslation";

interface SavedPass {
  id: string;
  data: QRPassData;
  qrCode: string;
  status: "active" | "expired" | "used";
}

const Pass = () => {
  const { t } = useTranslation();
  const [passes, setPasses] = useState<SavedPass[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    purpose: "",
    timeslot: ""
  });
  
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [availablePurposes, setAvailablePurposes] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  const { error: formError, setError: setFormError, clearError: clearFormError, withErrorHandling } = useErrorHandler();

  useEffect(() => {
    // Load saved passes from localStorage
    const savedPasses = localStorage.getItem("kumbh-passes");
    if (savedPasses) {
      setPasses(JSON.parse(savedPasses));
    }
    
    // Initialize available options
    updateAvailableOptions();
  }, []);

  // Update available options based on gate availability
  const updateAvailableOptions = () => {
    const purposes = ["darshan", "aarti", "event", "vip", "volunteer"];
    const timeSlots = [
      "6:00-8:00", "8:00-10:00", "10:00-12:00", 
      "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"
    ];

    // Filter purposes that have at least one available time slot
    const availablePurposesList = purposes.filter(purpose => 
      timeSlots.some(timeSlot => hasAvailabilityForSlot(purpose, timeSlot))
    );

    // Filter time slots that have availability for the selected purpose or any purpose if none selected
    const availableTimeSlotsList = timeSlots.filter(timeSlot => {
      if (formData.purpose) {
        return hasAvailabilityForSlot(formData.purpose, timeSlot);
      }
      return purposes.some(purpose => hasAvailabilityForSlot(purpose, timeSlot));
    });

    setAvailablePurposes(availablePurposesList);
    setAvailableTimeSlots(availableTimeSlotsList);
  };

  // Update available options when form data changes
  useEffect(() => {
    updateAvailableOptions();
  }, [formData.purpose]);

  const handleGeneratePass = withErrorHandling(async () => {
    const userData = localStorage.getItem("kumbh-user");
    if (!userData) return;

    const user = JSON.parse(userData);
    
    // Validate required fields
    if (!formData.purpose || !formData.timeslot) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please provide your location for gate allocation.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Use heuristic allocation to assign gate
      const allocationResult = allocateGate(
        userLocation,
        formData.purpose,
        formData.timeslot
      );

      if (!allocationResult.success) {
        toast({
          title: "Allocation Failed",
          description: allocationResult.error || "No gates available for this time slot/purpose.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      const passData = {
        id: allocationResult.qrData!.id,
        userId: user.id,
        name: user.name,
        role: user.role,
        timeslot: formData.timeslot,
        gate: allocationResult.gate!.name,
        purpose: formData.purpose,
        validUntil: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      const qrCode = await generateQRPass(passData);
      
      const newPass: SavedPass = {
        id: passData.id,
        data: { ...passData, signature: "mock_signature" },
        qrCode,
        status: "active"
      };

      const updatedPasses = [...passes, newPass];
      setPasses(updatedPasses);
      localStorage.setItem("kumbh-passes", JSON.stringify(updatedPasses));

      toast({
        title: t.pass.messages.generateSuccess,
        description: t.pass.messages.generateSuccessDesc
      });

      setShowGenerator(false);
      setFormData({ purpose: "", timeslot: "" });
      setUserLocation(null);
      updateAvailableOptions(); // Refresh available options
    } catch (error) {
      toast({
        title: t.pass.messages.generateError, 
        description: "Could not generate QR pass. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  });

  const handleLocationChange = (location: UserLocation | null) => {
    setUserLocation(location);
    setLocationError("");
  };

  const handleLocationError = (error: string) => {
    setLocationError(error);
    setUserLocation(null);
  };

  const handleDeletePass = (passId: string) => {
    const updatedPasses = passes.filter(pass => pass.id !== passId);
    setPasses(updatedPasses);
    localStorage.setItem("kumbh-passes", JSON.stringify(updatedPasses));
    
    toast({
      title: "Pass Deleted",
      description: "QR pass has been successfully removed.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-4 h-4 text-forest" />;
      case "expired": return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "used": return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-forest text-white";
      case "expired": return "bg-muted text-muted-foreground";
      case "used": return "bg-destructive text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-poppins font-bold">{t.pass.title}</h1>
          <p className="text-muted-foreground">{t.pass.subtitle}</p>
        </div>
        <Button onClick={() => setShowGenerator(true)} className="bg-saffron hover:bg-saffron-dark">
          <Plus className="w-4 h-4 mr-2" />
          {t.pass.createPass}
        </Button>
      </div>

      {showGenerator && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              Generate New Pass
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Input */}
            <LocationInput
              onLocationChange={handleLocationChange}
              onLocationError={handleLocationError}
              disabled={isGenerating}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">{t.pass.form.purpose} *</Label>
                <Select 
                  value={formData.purpose} 
                  onValueChange={(value) => setFormData({...formData, purpose: value})}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.pass.form.selectPurpose} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePurposes.includes("darshan") && (
                      <SelectItem value="darshan">{t.pass.purposes.darshan}</SelectItem>
                    )}
                    {availablePurposes.includes("aarti") && (
                      <SelectItem value="aarti">Evening Aarti</SelectItem>
                    )}
                    {availablePurposes.includes("event") && (
                      <SelectItem value="event">Special Event</SelectItem>
                    )}
                    {availablePurposes.includes("vip") && (
                      <SelectItem value="vip">VIP Access</SelectItem>
                    )}
                    {availablePurposes.includes("volunteer") && (
                      <SelectItem value="volunteer">{t.pass.purposes.volunteer}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availablePurposes.length === 0 && (
                  <p className="text-sm text-destructive">{t.pass.messages.noAvailability}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeslot">{t.pass.form.timeSlot} *</Label>
                <Select 
                  value={formData.timeslot} 
                  onValueChange={(value) => setFormData({...formData, timeslot: value})}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.pass.form.selectTimeSlot} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.includes("6:00-8:00") && (
                      <SelectItem value="6:00-8:00">6:00 AM - 8:00 AM</SelectItem>
                    )}
                    {availableTimeSlots.includes("8:00-10:00") && (
                      <SelectItem value="8:00-10:00">8:00 AM - 10:00 AM</SelectItem>
                    )}
                    {availableTimeSlots.includes("10:00-12:00") && (
                      <SelectItem value="10:00-12:00">10:00 AM - 12:00 PM</SelectItem>
                    )}
                    {availableTimeSlots.includes("12:00-14:00") && (
                      <SelectItem value="12:00-14:00">12:00 PM - 2:00 PM</SelectItem>
                    )}
                    {availableTimeSlots.includes("14:00-16:00") && (
                      <SelectItem value="14:00-16:00">2:00 PM - 4:00 PM</SelectItem>
                    )}
                    {availableTimeSlots.includes("16:00-18:00") && (
                      <SelectItem value="16:00-18:00">4:00 PM - 6:00 PM</SelectItem>
                    )}
                    {availableTimeSlots.includes("18:00-20:00") && (
                      <SelectItem value="18:00-20:00">6:00 PM - 8:00 PM</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availableTimeSlots.length === 0 && (
                  <p className="text-sm text-destructive">No time slots available for selected purpose</p>
                )}
              </div>
            </div>

            {/* Gate Auto-Assignment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Automatic Gate Assignment</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your entry gate will be automatically assigned based on your location and gate availability. 
                    This ensures optimal crowd distribution and minimal travel time.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGeneratePass}
                disabled={
                  isGenerating || 
                  !userLocation || 
                  !formData.purpose || 
                  !formData.timeslot ||
                  availablePurposes.length === 0 ||
                  availableTimeSlots.length === 0
                }
                className="bg-saffron hover:bg-saffron-dark"
              >
                {isGenerating ? "Generating..." : t.pass.form.generate}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowGenerator(false);
                  setFormData({ purpose: "", timeslot: "" });
                  setUserLocation(null);
                  setLocationError("");
                }}
              >
                {t.pass.form.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Passes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {passes.filter(p => p.status === "active").length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <QrCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">{t.pass.noPassesYet}</h3>
                <p className="text-muted-foreground mb-4">Generate a new pass to get started</p>
                <Button onClick={() => setShowGenerator(true)} variant="outline">
                  {t.pass.form.generate}
                </Button>
              </CardContent>
            </Card>
          ) : (
            passes.filter(p => p.status === "active").map((pass) => (
              <Card key={pass.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePass(pass.id)}
                  className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground z-10"
                  title="Delete pass"
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{pass.data.purpose}</h3>
                        <Badge className={getStatusColor(pass.status)}>
                          {getStatusIcon(pass.status)}
                          <span className="ml-1 capitalize">{pass.status}</span>
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Time:</span> {pass.data.timeslot}
                        </div>
                        <div>
                          <span className="font-medium">Gate:</span> {pass.data.gate}
                        </div>
                        <div>
                          <span className="font-medium">Role:</span> {pass.data.role}
                        </div>
                        <div>
                          <span className="font-medium">Valid Until:</span> {new Date(pass.data.validUntil).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <img 
                        src={pass.qrCode} 
                        alt="QR Code" 
                        className="w-24 h-24 border border-border rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {passes.filter(p => p.status === "used").length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Used Passes</h3>
                <p className="text-muted-foreground">Your used passes will appear here</p>
              </CardContent>
            </Card>
          ) : (
            passes.filter(p => p.status === "used").map((pass) => (
              <Card key={pass.id} className="opacity-75 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePass(pass.id)}
                  className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground z-10"
                  title="Delete pass"
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{pass.data.purpose}</h3>
                      <p className="text-sm text-muted-foreground">
                        Used on {new Date(pass.data.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(pass.status)}>
                      {getStatusIcon(pass.status)}
                      <span className="ml-1">Used</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {passes.filter(p => p.status === "expired").length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Expired Passes</h3>
                <p className="text-muted-foreground">Your expired passes will appear here</p>
              </CardContent>
            </Card>
          ) : (
            passes.filter(p => p.status === "expired").map((pass) => (
              <Card key={pass.id} className="opacity-60 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePass(pass.id)}
                  className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground z-10"
                  title="Delete pass"
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{pass.data.purpose}</h3>
                      <p className="text-sm text-muted-foreground">
                        Expired on {new Date(pass.data.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(pass.status)}>
                      {getStatusIcon(pass.status)}
                      <span className="ml-1">Expired</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      </div>
    </ErrorBoundary>
  );
};

export default Pass;