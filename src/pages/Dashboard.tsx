import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, useLocation, Navigate } from "react-router-dom";
import PilgrimDashboard from "@/components/dashboards/PilgrimDashboard";
import VIPDashboard from "@/components/dashboards/VIPDashboard";
import VolunteerDashboard from "@/components/dashboards/VolunteerDashboard";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("kumbh-user");
    if (!userData) {
      navigate("/auth/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Redirect to role-specific dashboard if on base dashboard route
    if (location.pathname === "/dashboard") {
      navigate(`/dashboard/${parsedUser.role}`, { replace: true });
    }
  }, [navigate, location.pathname]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-saffron"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/pilgrim" element={<PilgrimDashboard />} />
      <Route path="/vip" element={<VIPDashboard />} />
      <Route path="/volunteer" element={<VolunteerDashboard />} />
      <Route path="/admin" element={<Navigate to="/admin" replace />} />
      <Route path="/media" element={<PilgrimDashboard />} />
    </Routes>
  );
};

export default Dashboard;