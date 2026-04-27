import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Key, Eye, EyeOff } from "lucide-react";

interface VIP {
  id: string;
  name: string;
  age: number;
  password: string; // In real app, this would be hashed
  bloodGroup: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

const VIPManagement = () => {
  const [vips, setVips] = useState<VIP[]>([
    {
      id: "VIP-001",
      name: "Rajesh Kumar Sharma",
      age: 65,
      password: "Admin@123", // Demo password - would be hashed in real app
      bloodGroup: "B+",
      createdAt: "2025-09-01",
      lastLogin: "2025-09-05",
      status: "active"
    },
    {
      id: "VIP-002", 
      name: "Priya Devi Agarwal",
      age: 58,
      password: "VIP@2025",
      bloodGroup: "A+",
      createdAt: "2025-09-02",
      lastLogin: "2025-09-04",
      status: "active"
    },
    {
      id: "VIP-003",
      name: "Dr. Suresh Chandra",
      age: 72,
      password: "Secure@789",
      bloodGroup: "O+",
      createdAt: "2025-09-03",
      status: "inactive"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVip, setEditingVip] = useState<VIP | null>(null);
  const [newVip, setNewVip] = useState({
    name: '',
    age: '',
    password: '',
    bloodGroup: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const generateVipId = () => {
    const nextNumber = vips.length + 1;
    return `VIP-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleAddVip = () => {
    if (!newVip.name || !newVip.age || !newVip.password || !newVip.bloodGroup) {
      alert('Please fill all fields');
      return;
    }

    const vip: VIP = {
      id: generateVipId(),
      name: newVip.name,
      age: parseInt(newVip.age),
      password: newVip.password,
      bloodGroup: newVip.bloodGroup,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setVips([...vips, vip]);
    setNewVip({ name: '', age: '', password: '', bloodGroup: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditVip = () => {
    if (!editingVip) return;

    setVips(vips.map(vip => 
      vip.id === editingVip.id ? editingVip : vip
    ));
    setIsEditDialogOpen(false);
    setEditingVip(null);
  };

  const handleDeleteVip = (id: string) => {
    setVips(vips.filter(vip => vip.id !== id));
  };

  const handleResetPassword = (id: string) => {
    const newPassword = `Reset@${Math.random().toString(36).slice(-6)}`;
    setVips(vips.map(vip => 
      vip.id === id ? { ...vip, password: newPassword } : vip
    ));
    alert(`Password reset to: ${newPassword}\nPlease share this securely with the VIP.`);
  };

  const toggleVipStatus = (id: string) => {
    setVips(vips.map(vip => 
      vip.id === id ? { ...vip, status: vip.status === 'active' ? 'inactive' : 'active' } : vip
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">VIP Management</h2>
          <p className="text-muted-foreground">Manage VIP registrations and access</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New VIP
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New VIP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newVip.name}
                  onChange={(e) => setNewVip({ ...newVip, name: e.target.value })}
                  placeholder="Enter VIP's full name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={newVip.age}
                  onChange={(e) => setNewVip({ ...newVip, age: e.target.value })}
                  placeholder="Enter age"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newVip.password}
                  onChange={(e) => setNewVip({ ...newVip, password: e.target.value })}
                  placeholder="Set initial password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  VIP will use this password for first login
                </p>
              </div>
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={newVip.bloodGroup} onValueChange={(value) => setNewVip({ ...newVip, bloodGroup: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddVip} className="flex-1">Add VIP</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* VIP Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VIPs</CardTitle>
            <Badge variant="secondary">{vips.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vips.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active VIPs</CardTitle>
            <Badge variant="default">{vips.filter(v => v.status === 'active').length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vips.filter(v => v.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive VIPs</CardTitle>
            <Badge variant="outline">{vips.filter(v => v.status === 'inactive').length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vips.filter(v => v.status === 'inactive').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
            <Badge variant="secondary">{vips.filter(v => v.lastLogin).length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vips.filter(v => v.lastLogin).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* VIP Table */}
      <Card>
        <CardHeader>
          <CardTitle>VIP Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VIP ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vips.map((vip) => (
                  <TableRow key={vip.id}>
                    <TableCell className="font-medium">{vip.id}</TableCell>
                    <TableCell>{vip.name}</TableCell>
                    <TableCell>{vip.age}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">••••••••</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(vip.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Key className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vip.bloodGroup}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={vip.status === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleVipStatus(vip.id)}
                      >
                        {vip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{vip.createdAt}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {vip.lastLogin || 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingVip(vip);
                            setIsEditDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete VIP</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {vip.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteVip(vip.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit VIP Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit VIP Details</DialogTitle>
          </DialogHeader>
          {editingVip && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingVip.name}
                  onChange={(e) => setEditingVip({ ...editingVip, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editingVip.age}
                  onChange={(e) => setEditingVip({ ...editingVip, age: parseInt(e.target.value) })}
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <Label htmlFor="edit-bloodGroup">Blood Group</Label>
                <Select 
                  value={editingVip.bloodGroup} 
                  onValueChange={(value) => setEditingVip({ ...editingVip, bloodGroup: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditVip} className="flex-1">Update VIP</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VIPManagement;
