import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Scan, CheckCircle, XCircle, Upload, History } from "lucide-react";
import { validateQRPass } from "@/utils/qrUtils";
import { useToast } from "@/hooks/use-toast";

interface ScanResult {
  id: string;
  timestamp: number;
  passData?: any;
  valid: boolean;
  error?: string;
}

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [manualInput, setManualInput] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load scan history from localStorage
    const savedResults = localStorage.getItem("kumbh-scan-results");
    if (savedResults) {
      setScanResults(JSON.parse(savedResults));
    }
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  const processQRData = (qrData: string) => {
    const validation = validateQRPass(qrData);
    
    const result: ScanResult = {
      id: `scan_${Date.now()}`,
      timestamp: Date.now(),
      valid: validation.valid,
      passData: validation.data,
      error: validation.error
    };

    const updatedResults = [result, ...scanResults.slice(0, 19)]; // Keep last 20 scans
    setScanResults(updatedResults);
    localStorage.setItem("kumbh-scan-results", JSON.stringify(updatedResults));

    if (validation.valid) {
      toast({
        title: "Valid Pass ✅",
        description: `Pass verified for ${validation.data?.name}`,
      });
    } else {
      toast({
        title: "Invalid Pass ❌",
        description: validation.error,
        variant: "destructive"
      });
    }

    stopScanning();
  };

  const handleManualScan = () => {
    if (!manualInput.trim()) return;
    
    try {
      processQRData(manualInput);
      setManualInput("");
    } catch (error) {
      toast({
        title: "Invalid Format",
        description: "Please enter valid QR code data.",
        variant: "destructive"
      });
    }
  };

  const simulateSuccessfulScan = () => {
    const mockQRData = JSON.stringify({
      id: `pass_${Date.now()}`,
      userId: "user123",
      name: "Ram Sharma",
      role: "pilgrim",
      timeslot: "14:00-16:00",
      gate: "main",
      purpose: "darshan",
      validUntil: Date.now() + (2 * 60 * 60 * 1000), // 2 hours from now
      signature: btoa(`mock_data_secret_key`)
    });
    
    processQRData(mockQRData);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-poppins font-bold mb-2">QR Code Scanner</h1>
        <p className="text-muted-foreground">Scan QR passes for verification and entry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scan className="w-5 h-5 mr-2" />
              Camera Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {scanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Camera preview will appear here</p>
                  </div>
                </div>
              )}
              
              {/* Scan overlay */}
              {scanning && (
                <div className="absolute inset-0 border-4 border-dashed border-saffron animate-pulse">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-48 h-48 border-2 border-saffron rounded-lg"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={startScanning} className="flex-1 bg-saffron hover:bg-saffron-dark">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline" className="flex-1">
                  Stop Scanning
                </Button>
              )}
              <Button onClick={simulateSuccessfulScan} variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                Test Scan
              </Button>
            </div>

            {/* Manual Input */}
            <div className="space-y-2">
              <h3 className="font-medium">Manual QR Input</h3>
              <Textarea
                placeholder="Paste QR code data here..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                rows={3}
              />
              <Button onClick={handleManualScan} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Process Manually
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scan Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scanResults.length === 0 ? (
                <div className="text-center py-8">
                  <Scan className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No scans yet</p>
                </div>
              ) : (
                scanResults.map((result) => (
                  <div key={result.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {result.valid ? (
                          <CheckCircle className="w-4 h-4 text-forest" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                        <Badge className={result.valid ? "bg-forest text-white" : "bg-destructive text-white"}>
                          {result.valid ? "Valid" : "Invalid"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {result.valid && result.passData ? (
                      <div className="text-sm space-y-1">
                        <div><strong>Name:</strong> {result.passData.name}</div>
                        <div><strong>Purpose:</strong> {result.passData.purpose}</div>
                        <div><strong>Time:</strong> {result.passData.timeslot}</div>
                        <div><strong>Gate:</strong> {result.passData.gate}</div>
                        <div><strong>Role:</strong> {result.passData.role}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-destructive">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-forest">
              {scanResults.filter(r => r.valid).length}
            </div>
            <p className="text-sm text-muted-foreground">Valid Scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {scanResults.filter(r => !r.valid).length}
            </div>
            <p className="text-sm text-muted-foreground">Invalid Scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-saffron">
              {scanResults.length}
            </div>
            <p className="text-sm text-muted-foreground">Total Scans</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scanner;