import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const userData = localStorage.getItem("kumbh-user");
    
    if (!userData) {
      navigate("/auth/login");
      return;
    }
    
    if (requiredRole) {
      const user = JSON.parse(userData);
      if (!requiredRole.includes(user.role)) {
        navigate("/dashboard");
        return;
      }
    }
  }, [navigate, requiredRole]);

  const userData = localStorage.getItem("kumbh-user");
  
  if (!userData) {
    return <LoadingScreen />;
  }
  
  if (requiredRole) {
    const user = JSON.parse(userData);
    if (!requiredRole.includes(user.role)) {
      return <LoadingScreen />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;