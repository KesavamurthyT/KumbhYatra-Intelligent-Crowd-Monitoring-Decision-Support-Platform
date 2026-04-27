import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Map,
  QrCode,
  Scan,
  Search,
  AlertTriangle,
  User,
  Settings,
  Shield,
  HandHeart,
  Crown,
  HelpCircle,
  LogOut,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LanguageSelector from "@/components/LanguageSelector";

interface User {
  role: string;
  name: string;
}

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { t } = useTranslation();
  const collapsed = state === "collapsed";
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("kumbh-user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("kumbh-user");
    localStorage.removeItem("kumbh-onboarded");
    navigate("/auth/login");
  };

  const getMenuItems = () => {
    // Role-specific navigation items
    switch (user?.role) {
      case "admin":
        return [
          { title: "Admin Panel", url: "/admin", icon: Shield },
          { title: "Map Admin", url: "/map", icon: Map },
        ];
      
      case "volunteer":
        return [
          { title: t.navigation.dashboard, url: `/dashboard/volunteer`, icon: Home },
          { title: t.navigation.map, url: "/map", icon: Map },
          { title: "Scanner", url: "/scanner", icon: Scan },
          { title: "Lost & Found", url: "/lost-found", icon: Search },
          { title: t.navigation.profile, url: "/profile", icon: User },
        ];
      
      case "vip":
        return [
          { title: t.navigation.dashboard, url: `/dashboard/vip`, icon: Home },
          { title: t.navigation.map, url: "/map", icon: Map },
          { title: "QR Pass", url: "/pass", icon: QrCode },
          { title: "VIP Services", url: "/vip", icon: Crown },
          { title: t.navigation.transport, url: "/transport", icon: Car },
          { title: t.navigation.profile, url: "/profile", icon: User },
        ];
      
      case "pilgrim":
      default:
        return [
          { title: t.navigation.dashboard, url: `/dashboard/pilgrim`, icon: Home },
          { title: t.navigation.map, url: "/map", icon: Map },
          { title: "QR Pass", url: "/pass", icon: QrCode },
          { title: "Lost & Found", url: "/lost-found", icon: Search },
          { title: t.navigation.sos, url: "/sos", icon: AlertTriangle },
          { title: t.navigation.transport, url: "/transport", icon: Car },
          { title: t.navigation.profile, url: "/profile", icon: User },
        ];
    }
  };

  const menuItems = getMenuItems();
  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🕉️</div>
            {!collapsed && (
              <div>
                <h2 className="font-poppins font-bold text-saffron">Kumbh Yatra</h2>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <SidebarGroup>
          <SidebarGroupLabel>{t.navigation.dashboard}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.url)}
                    className={isActive(item.url) ? "bg-saffron/10 text-saffron font-medium" : ""}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/help")}>
                  <HelpCircle className="h-4 w-4" />
                  {!collapsed && <span>{t.navigation.help}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>{t.navigation.logout}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!collapsed && (
                <SidebarMenuItem>
                  <div className="px-2 py-1">
                    <LanguageSelector variant="compact" className="w-full justify-start" />
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;