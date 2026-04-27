import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Upload, 
  Camera, 
  MapPin, 
  Clock, 
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react";
import { lostItems } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface LostItem {
  id: string;
  type: string;
  description: string;
  location: string;
  status: "active" | "claimed" | "returned";
  submittedBy: string;
  timestamp: number;
  photos: string[];
  contactInfo?: string;
  matchConfidence?: number;
}

const LostFound = () => {
  const { t } = useTranslation();
  const API_BASE = 'http://localhost:3001/api';
  const [reportForm, setReportForm] = useState({
    type: "",
    description: "",
    location: "",
    contactInfo: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<LostItem[]>(lostItems as LostItem[]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [aiMatches, setAiMatches] = useState<LostItem[]>([]);
  const lostFileInputRef = useRef<HTMLInputElement>(null);
  const foundFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [matchedItems, setMatchedItems] = useState<{ lost: LostItem; found: LostItem; confidence: number; matchedAt: number; }[]>([]);
  const [activeTab, setActiveTab] = useState("lost");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<LostItem | null>(null);
  const [lostPhotos, setLostPhotos] = useState<string[]>([]);
  const [foundPhotos, setFoundPhotos] = useState<string[]>([]);

  // Found item reporting state (for volunteers)
  const [showFoundReportForm, setShowFoundReportForm] = useState(false);
  const [foundReportForm, setFoundReportForm] = useState({
    type: "",
    description: "",
    location: "",
    contactInfo: ""
  });

  const handleLostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const previews = files.map(f => URL.createObjectURL(f));
      setLostPhotos(prev => [...prev, ...previews]);
      toast({
        title: "Image Uploaded",
        description: `${files.length} image(s) uploaded for AI analysis.`
      });
      
      // Simulate AI matching
      setTimeout(() => {
        const mockMatches = items.filter(item => 
          Math.random() > 0.7 // Random matching simulation
        ).map(item => ({
          ...item,
          matchConfidence: Math.floor(Math.random() * 40) + 60 // 60-100% confidence
        }));
        
        setAiMatches(mockMatches);
        
        if (mockMatches.length > 0) {
          toast({
            title: t.lostFound.aiMatchesFound,
            description: `Found ${mockMatches.length} potential matches.`
          });
        }
      }, 2000);
    }
  };

  const handleFoundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const previews = files.map(f => URL.createObjectURL(f));
      setFoundPhotos(prev => [...prev, ...previews]);
      toast({
        title: "Image Uploaded",
        description: `${files.length} image(s) uploaded for AI analysis.`
      });
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.type || !reportForm.description || !reportForm.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/lost-found`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportForm.type,
          description: reportForm.description,
          location: reportForm.location,
          contactInfo: reportForm.contactInfo,
          submittedBy: 'pilgrim'
        })
      });
      const data = await res.json();
      if (data.ok) {
        const withPhotos = { ...data.item, photos: lostPhotos } as LostItem;
        setItems([withPhotos, ...items]);
        setReportForm({ type: "", description: "", location: "", contactInfo: "" });
        setLostPhotos([]);
        setShowReportForm(false);
        toast({
          title: t.lostFound.messages.reportSuccess,
          description: t.lostFound.messages.reportSuccessDesc
        });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to report item', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Network error', description: 'Could not reach server', variant: 'destructive' });
    }
  };

  const handleFoundReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foundReportForm.type || !foundReportForm.description || !foundReportForm.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/lost-found`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: foundReportForm.type,
          description: foundReportForm.description,
          location: foundReportForm.location,
          contactInfo: foundReportForm.contactInfo,
          submittedBy: 'volunteer'
        })
      });
      const data = await res.json();
      if (data.ok) {
        const withPhotos = { ...data.item, photos: foundPhotos } as LostItem;
        setItems([withPhotos, ...items]);
        setFoundReportForm({ type: "", description: "", location: "", contactInfo: "" });
        setFoundPhotos([]);
        setShowFoundReportForm(false);
        toast({
          title: t.lostFound.messages.reportSuccess,
          description: t.lostFound.messages.reportSuccessDesc
        });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to report item', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Network error', description: 'Could not reach server', variant: 'destructive' });
    }
  };

  // Initial load from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/lost-found`);
        const data = await res.json();
        if (data.ok) setItems(data.items);
      } catch {}
    })();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-saffron text-white";
      case "claimed": return "bg-forest text-white";
      case "returned": return "bg-river text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      bag: "🎒",
      phone: "📱", 
      jewelry: "💍",
      documents: "📄",
      clothing: "👕",
      electronics: "💻",
      other: "📦"
    };
    return icons[type] || "📦";
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await fetch(`${API_BASE}/lost-found/${id}`, { method: 'DELETE' });
    } catch {}
    setItems(prev => prev.filter(i => i.id !== id));
    setMatchedItems(prev => prev.filter(p => p.lost.id !== id && p.found.id !== id));
  };

  // Simple local matching logic to pair a pilgrim-reported lost with a volunteer-reported found
  const calculateTextScore = (a: string, b: string) => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 2);
    const wa = normalize(a);
    const wb = normalize(b);
    if (wa.length === 0 || wb.length === 0) return 0;
    const setA = new Set(wa);
    const setB = new Set(wb);
    let inter = 0;
    setA.forEach(w => { if (setB.has(w)) inter++; });
    const union = new Set([...wa, ...wb]).size || 1;
    const unigram = inter / union;
    // bigram similarity
    const bigrams = (arr: string[]) => arr.slice(0, -1).map((_, i) => arr[i] + " " + arr[i+1]);
    const ba = new Set(bigrams(wa));
    const bb = new Set(bigrams(wb));
    let binter = 0; ba.forEach(x => { if (bb.has(x)) binter++; });
    const bunion = new Set([...ba, ...bb]).size || 1;
    const bigram = binter / bunion;
    return 0.7 * unigram + 0.3 * bigram; // weighted
  };

  const scoreMatch = (lost: LostItem, found: LostItem) => {
    let score = 0;
    if (lost.type === found.type) score += 0.4;
    score += calculateTextScore(lost.description, found.description) * 0.4;
    score += calculateTextScore(lost.location, found.location) * 0.2;
    return Math.round(Math.min(score, 1) * 100); // 0..100
  };

  const findBestFoundForLost = (lost: LostItem) => {
    const candidates = items.filter(i => i.submittedBy === 'volunteer');
    let best: { item: LostItem; confidence: number } | null = null;
    candidates.forEach(c => {
      const conf = scoreMatch(lost, c);
      if (!best || conf > best.confidence) best = { item: c, confidence: conf };
    });
    return best;
  };

  // Client-side image hashing (pHash-like simplified) for boosting match accuracy
  const getImageHash = (src: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          canvas.width = 8; canvas.height = 8;
          ctx.drawImage(img, 0, 0, 8, 8);
          const data = ctx.getImageData(0, 0, 8, 8).data;
          const gray: number[] = [];
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            gray.push(Math.round(0.299*r + 0.587*g + 0.114*b));
          }
          const avg = gray.reduce((a, b) => a + b, 0) / gray.length;
          const hash = gray.map(v => (v >= avg ? '1' : '0')).join('');
          resolve(hash);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const hashSimilarity = (h1: string, h2: string) => {
    if (!h1 || !h2 || h1.length !== h2.length) return 0;
    let same = 0;
    for (let i = 0; i < h1.length; i++) if (h1[i] === h2[i]) same++;
    return same / h1.length; // 0..1
  };

  // Backend AI match using /api/lost-found/ai-match (Gemini-enhanced if configured)
  const handleAIMatchLost = async (lost: LostItem) => {
    try {
      // Optional client-side image hash boosting
      let bestImageBoost = 0;
      if (lost.photos && lost.photos.length > 0) {
        const lostHash = await getImageHash(lost.photos[0]);
        if (lostHash) {
          const foundCandidates = items.filter(i => i.submittedBy === 'volunteer' && i.photos && i.photos.length > 0);
          for (const c of foundCandidates) {
            const h = await getImageHash(c.photos[0]);
            if (h) bestImageBoost = Math.max(bestImageBoost, hashSimilarity(lostHash, h));
          }
        }
      }
      const res = await fetch(`${API_BASE}/lost-found/ai-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: lost.description,
          type: lost.type,
          location: lost.location
        })
      });
      const data = await res.json();
      if (!data.ok || !Array.isArray(data.matches) || data.matches.length === 0) {
        toast({ title: 'No AI matches', description: 'No suitable matches were found.' });
        return;
      }
      // Pick the best candidate that exists in current list and was submitted by volunteer, show accuracy
      let candidate = data.matches
        .map((m: any) => ({ item: m.item, confidence: m.confidence }))
        .filter((m: any) => m.item?.submittedBy === 'volunteer')
        .map((m: any) => ({
          item: items.find(i => i.id === m.item.id) || m.item,
          confidence: m.confidence
        }))
        .sort((a: any, b: any) => b.confidence - a.confidence)[0];

      // Apply image boost (up to +20%) if strong visual similarity detected
      if (candidate && bestImageBoost > 0.7) {
        candidate = { ...candidate, confidence: Math.min(100, Math.round(candidate.confidence + 20)) };
      }

      if (!candidate) {
        toast({ title: 'No AI matches', description: 'No suitable volunteer items were found.' });
        return;
      }
      try { await fetch(`${API_BASE}/lost-found/${lost.id}`, { method: 'DELETE' }); } catch {}
      try { await fetch(`${API_BASE}/lost-found/${candidate.item.id}`, { method: 'DELETE' }); } catch {}
      setMatchedItems([{ lost, found: candidate.item, confidence: candidate.confidence, matchedAt: Date.now() }, ...matchedItems]);
      setItems(prev => prev.filter(i => i.id !== lost.id && i.id !== candidate.item.id));
      toast({ title: 'AI match created', description: `Matched with ${candidate.confidence}% accuracy.` });
      setActiveTab('matched');
    } catch {
      toast({ title: 'Network error', description: 'Could not reach AI match service', variant: 'destructive' });
    }
  };

  const handleAIMatchFound = async (found: LostItem) => {
    try {
      // Optional client-side image hash boosting
      let bestImageBoost = 0;
      if (found.photos && found.photos.length > 0) {
        const foundHash = await getImageHash(found.photos[0]);
        if (foundHash) {
          const lostCandidates = items.filter(i => i.submittedBy === 'pilgrim' && i.photos && i.photos.length > 0);
          for (const c of lostCandidates) {
            const h = await getImageHash(c.photos[0]);
            if (h) bestImageBoost = Math.max(bestImageBoost, hashSimilarity(foundHash, h));
          }
        }
      }
      const res = await fetch(`${API_BASE}/lost-found/ai-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: found.description,
          type: found.type,
          location: found.location
        })
      });
      const data = await res.json();
      if (!data.ok || !Array.isArray(data.matches) || data.matches.length === 0) {
        toast({ title: 'No AI matches', description: 'No suitable matches were found.' });
        return;
      }
      // Prefer a pilgrim (lost) candidate, show accuracy
      let candidate = data.matches
        .map((m: any) => ({ item: m.item, confidence: m.confidence }))
        .filter((m: any) => m.item?.submittedBy === 'pilgrim')
        .map((m: any) => ({
          item: items.find(i => i.id === m.item.id) || m.item,
          confidence: m.confidence
        }))
        .sort((a: any, b: any) => b.confidence - a.confidence)[0];

      if (candidate && bestImageBoost > 0.7) {
        candidate = { ...candidate, confidence: Math.min(100, Math.round(candidate.confidence + 20)) };
      }

      if (!candidate) {
        toast({ title: 'No AI matches', description: 'No suitable pilgrim items were found.' });
        return;
      }
      try { await fetch(`${API_BASE}/lost-found/${found.id}`, { method: 'DELETE' }); } catch {}
      try { await fetch(`${API_BASE}/lost-found/${candidate.item.id}`, { method: 'DELETE' }); } catch {}
      setMatchedItems([{ lost: candidate.item, found, confidence: candidate.confidence, matchedAt: Date.now() }, ...matchedItems]);
      setItems(prev => prev.filter(i => i.id !== found.id && i.id !== candidate.item.id));
      toast({ title: 'AI match created', description: `Matched with ${candidate.confidence}% accuracy.` });
      setActiveTab('matched');
    } catch {
      toast({ title: 'Network error', description: 'Could not reach AI match service', variant: 'destructive' });
    }
  };

  const filteredItems = items.filter(item =>
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-poppins font-bold">{t.lostFound.title}</h1>
          <p className="text-muted-foreground">{t.lostFound.subtitle}</p>
        </div>
        <Button 
          onClick={() => setShowReportForm(true)} 
          className="bg-saffron hover:bg-saffron-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.lostFound.reportItem}
        </Button>
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.lostFound.reportItem}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t.lostFound.form.itemType} *</Label>
                  <Select value={reportForm.type} onValueChange={(value) => setReportForm({...reportForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.lostFound.form.selectType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bag">{t.lostFound.types.bag}</SelectItem>
                      <SelectItem value="phone">{t.lostFound.types.phone}</SelectItem>
                      <SelectItem value="jewelry">{t.lostFound.types.jewelry}</SelectItem>
                      <SelectItem value="documents">{t.lostFound.types.documents}</SelectItem>
                      <SelectItem value="clothing">{t.lostFound.types.clothing}</SelectItem>
                      <SelectItem value="electronics">{t.lostFound.types.electronics}</SelectItem>
                      <SelectItem value="other">{t.lostFound.types.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t.lostFound.form.location} *</Label>
                  <Input
                    id="location"
                    placeholder={t.lostFound.form.locationPlaceholder}
                    value={reportForm.location}
                    onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.lostFound.form.description} *</Label>
                <Textarea
                  id="description"
                  placeholder={t.lostFound.form.descriptionPlaceholder}
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">{t.lostFound.form.contactInfo}</Label>
                <Input
                  id="contact"
                  placeholder={t.lostFound.form.contactPlaceholder}
                  value={reportForm.contactInfo}
                  onChange={(e) => setReportForm({...reportForm, contactInfo: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Photos (AI Analysis)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    ref={lostFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleLostImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => lostFileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t.lostFound.uploadImages}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t.lostFound.aiAnalysisText}
                  </p>
                  {lostPhotos.length > 0 && (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {lostPhotos.map((src, idx) => (
                        <img key={idx} src={src} alt="preview" className="w-full h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-saffron hover:bg-saffron-dark">
                  {t.lostFound.form.submit}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowReportForm(false)}>
                  {t.lostFound.form.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* AI Matches */}
      {aiMatches.length > 0 && (
        <Card className="mb-6 border-saffron">
          <CardHeader>
            <CardTitle className="flex items-center text-saffron">
              <AlertCircle className="w-5 h-5 mr-2" />
              {t.lostFound.aiMatchesFound}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiMatches.map((match) => (
                <div key={match.id} className="border border-saffron rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getTypeIcon(match.type)}</span>
                      <div>
                        <h3 className="font-medium">{match.description}</h3>
                        <p className="text-sm text-muted-foreground">{match.location}</p>
                      </div>
                    </div>
                    <Badge className="bg-saffron text-white">
                      {match.matchConfidence}% {t.lostFound.match}
                    </Badge>
                  </div>
                  <Button size="sm" className="w-full">
                    {t.lostFound.contactSubmitter}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="lost">{t.lostFound.tabs.lostItems}</TabsTrigger>
            <TabsTrigger value="found">{t.lostFound.tabs.foundItems}</TabsTrigger>
            <TabsTrigger value="matched">Matched Items</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.lostFound.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        

        <TabsContent value="lost">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.filter(item => item.submittedBy === "pilgrim").map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div>
                        <h3 className="font-medium text-sm">{item.description}</h3>
                        <p className="text-xs text-muted-foreground">{t.lostFound.lostItem}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {t.lostFound.status[item.status as keyof typeof t.lostFound.status]}
                      </Badge>
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveItem(item.id)} aria-label="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => { setDetailsItem(item); setDetailsOpen(true); }}>
                      <Eye className="w-3 h-3 mr-1" />
                      {t.lostFound.viewDetails}
                    </Button>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAIMatchLost(item)}>
                        AI Match
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="found">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Report Found Item Card */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                {!showFoundReportForm ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <Plus className="w-6 h-6 text-saffron" />
                    <div>
                      <h3 className="font-medium">Report Found Item</h3>
                      <p className="text-xs text-muted-foreground">Add a found item to help locate owners</p>
                    </div>
                    <Button size="sm" className="bg-saffron hover:bg-saffron-dark" onClick={() => setShowFoundReportForm(true)}>
                      <Plus className="w-3 h-3 mr-1" /> Report Found Item
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleFoundReportSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="found-type">{t.lostFound.form.itemType} *</Label>
                        <Select value={foundReportForm.type} onValueChange={(value) => setFoundReportForm({...foundReportForm, type: value})}>
                          <SelectTrigger id="found-type">
                            <SelectValue placeholder={t.lostFound.form.selectType} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bag">{t.lostFound.types.bag}</SelectItem>
                            <SelectItem value="phone">{t.lostFound.types.phone}</SelectItem>
                            <SelectItem value="jewelry">{t.lostFound.types.jewelry}</SelectItem>
                            <SelectItem value="documents">{t.lostFound.types.documents}</SelectItem>
                            <SelectItem value="clothing">{t.lostFound.types.clothing}</SelectItem>
                            <SelectItem value="electronics">{t.lostFound.types.electronics}</SelectItem>
                            <SelectItem value="other">{t.lostFound.types.other}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="found-location">{t.lostFound.form.location} *</Label>
                        <Input
                          id="found-location"
                          placeholder={t.lostFound.form.locationPlaceholder}
                          value={foundReportForm.location}
                          onChange={(e) => setFoundReportForm({...foundReportForm, location: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="found-description">{t.lostFound.form.description} *</Label>
                        <Textarea
                          id="found-description"
                          placeholder={t.lostFound.form.descriptionPlaceholder}
                          value={foundReportForm.description}
                          onChange={(e) => setFoundReportForm({...foundReportForm, description: e.target.value})}
                          rows={3}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="found-contact">{t.lostFound.form.contactInfo}</Label>
                        <Input
                          id="found-contact"
                          placeholder={t.lostFound.form.contactPlaceholder}
                          value={foundReportForm.contactInfo}
                          onChange={(e) => setFoundReportForm({...foundReportForm, contactInfo: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Upload Photos (AI Analysis)</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                          <input
                            ref={foundFileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFoundImageUpload}
                            className="hidden"
                          />
                          <Button type="button" variant="outline" onClick={() => foundFileInputRef.current?.click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            {t.lostFound.uploadImages}
                          </Button>
                          <p className="text-sm text-muted-foreground mt-2">{t.lostFound.aiAnalysisText}</p>
                          {foundPhotos.length > 0 && (
                            <div className="mt-3 grid grid-cols-5 gap-2">
                              {foundPhotos.map((src, idx) => (
                                <img key={idx} src={src} alt="preview" className="w-full h-16 object-cover rounded" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="bg-saffron hover:bg-saffron-dark">Submit</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowFoundReportForm(false)}>Cancel</Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
            {filteredItems.filter(item => item.submittedBy === "volunteer").map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div>
                        <h3 className="font-medium text-sm">{item.description}</h3>
                        <p className="text-xs text-muted-foreground">{t.lostFound.foundItem}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {t.lostFound.status[item.status as keyof typeof t.lostFound.status]}
                      </Badge>
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveItem(item.id)} aria-label="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => { setDetailsItem(item); setDetailsOpen(true); }}>
                      <Eye className="w-3 h-3 mr-1" />
                      {t.lostFound.viewDetails}
                    </Button>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAIMatchFound(item)}>
                        AI Match
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matched">
          {matchedItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="font-medium mb-2">No matched items yet</h3>
                <p className="text-muted-foreground">Use Match/Find Owner to pair items.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedItems.map((pair) => (
                <Card key={`${pair.lost.id}_${pair.found.id}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Matched Pair</span>
                      <Badge className="bg-forest text-white">{pair.confidence}%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="text-sm">
                      <div className="font-medium mb-1">Lost (Pilgrim)</div>
                      <div className="text-muted-foreground">{pair.lost.description}</div>
                      <div className="text-muted-foreground text-xs capitalize">{pair.lost.type} • {pair.lost.location}</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">Found (Volunteer)</div>
                      <div className="text-muted-foreground">{pair.found.description}</div>
                      <div className="text-muted-foreground text-xs capitalize">{pair.found.type} • {pair.found.location}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Matched on {new Date(pair.matchedAt).toLocaleString()}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
          </DialogHeader>
          {detailsItem && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(detailsItem.type)}</span>
                  <span className="capitalize text-muted-foreground">{detailsItem.type}</span>
                </div>
                <Badge className={getStatusColor(detailsItem.status)}>
                  {t.lostFound.status[detailsItem.status as keyof typeof t.lostFound.status]}
                </Badge>
              </div>
              <div>
                <div className="font-medium mb-1">Description</div>
                <div className="text-muted-foreground">{detailsItem.description}</div>
              </div>
              <div className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {detailsItem.location}</div>
              <div className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(detailsItem.timestamp).toLocaleString()}</div>
              {detailsItem.contactInfo && (
                <div>
                  <div className="font-medium mb-1">Contact</div>
                  <div className="text-muted-foreground">{detailsItem.contactInfo}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LostFound;