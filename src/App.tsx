import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Page imports with lazy loading for performance
import { lazy, Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";

// Core pages (immediate load)
import Index from "./pages/Index";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import AuthLogin from "./pages/auth/Login";
import AuthRegister from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Map = lazy(() => import("./pages/Map"));
const Pass = lazy(() => import("./pages/Pass"));
const Scanner = lazy(() => import("./pages/Scanner"));
const LostFound = lazy(() => import("./pages/LostFound"));
const SOS = lazy(() => import("./pages/SOS"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const Volunteer = lazy(() => import("./pages/Volunteer"));
const VIP = lazy(() => import("./pages/VIP"));
const Help = lazy(() => import("./pages/Help"));

const VolunteerDashboard = lazy(() => import("./components/dashboards/VolunteerDashboard"));
const PilgrimDashboard = lazy(() => import("./components/dashboards/PilgrimDashboard"));
const VIPDashboard = lazy(() => import("./components/dashboards/VIPDashboard"));
const TransportIntelligence = lazy(() => import("./pages/TransportIntelligence"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Core flow */}
            <Route path="/" element={<Index />} />
            <Route path="/splash" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Authentication */}
            <Route path="/auth/login" element={<AuthLogin />} />
            <Route path="/auth/register" element={<AuthRegister />} />
            
            {/* Protected app routes with layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/pilgrim" element={
              <ProtectedRoute requiredRole={["pilgrim"]}>
                <AppLayout>
                  <PilgrimDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/volunteer" element={
              <ProtectedRoute requiredRole={["volunteer"]}>
                <AppLayout>
                  <VolunteerDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/vip" element={
              <ProtectedRoute requiredRole={["vip"]}>
                <AppLayout>
                  <VIPDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <AppLayout>
                  <Map />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/pass" element={
              <ProtectedRoute>
                <AppLayout>
                  <Pass />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/scanner" element={
              <ProtectedRoute requiredRole={["admin", "volunteer"]}>
                <AppLayout>
                  <Scanner />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/lost-found" element={
              <ProtectedRoute>
                <AppLayout>
                  <LostFound />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/sos" element={
              <ProtectedRoute>
                <AppLayout>
                  <SOS />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/transport" element={
              <ProtectedRoute>
                <AppLayout>
                  <TransportIntelligence />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Role-specific routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={["admin"]}>
                <AppLayout>
                  <Admin />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/volunteer" element={
              <ProtectedRoute requiredRole={["volunteer"]}>
                <AppLayout>
                  <Volunteer />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/vip" element={
              <ProtectedRoute requiredRole={["vip"]}>
                <AppLayout>
                  <VIP />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Support */}
            <Route path="/help" element={
              <ProtectedRoute>
                <AppLayout>
                  <Help />
                </AppLayout>
              </ProtectedRoute>
            } />
            

            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;