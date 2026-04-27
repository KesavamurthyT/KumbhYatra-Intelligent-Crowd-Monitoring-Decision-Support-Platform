import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const KumbhYatraLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = () => {
    // Button is static for now - routing logic will be handled in backend
  };

  const fillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    // Add a small visual feedback
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (emailInput && passwordInput) {
      emailInput.focus();
      setTimeout(() => passwordInput.focus(), 100);
      setTimeout(() => emailInput.blur(), 200);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Define credentials for different user types
    const credentials = {
      // Pilgrim credentials
      pilgrim: { email: "pilgrimroshan@gmail.com", password: "Devotee@2025" },
      // Volunteer credentials  
      volunteer: { email: "volunteerkalkin@gmail.com", password: "Volunteer@2025" },
      // VIP credentials
      vip: { email: "vipashfaq@gmail.com", password: "VipAccess@2025" },
      // Admin credentials
      admin: { email: "adminkeshava@gmail.com", password: "KumbhAdmin@2025" }
    };

    // Check which role matches the entered credentials
    if (email === credentials.pilgrim.email && password === credentials.pilgrim.password) {
      // Pilgrim login
      console.log('🙏 Pilgrim login successful, going to pilgrim dashboard');
      localStorage.setItem("kumbh-user", JSON.stringify({
        id: "pilgrim-demo",
        role: "pilgrim",
        name: "Pilgrim User",
        email: email,
        phone: "+91-7777777777",
        verified: true
      }));
      window.location.href = "http://localhost:8080/dashboard/pilgrim";
    } else if (email === credentials.volunteer.email && password === credentials.volunteer.password) {
      // Volunteer login
      console.log('🤝 Volunteer login successful, going to volunteer dashboard');
      localStorage.setItem("kumbh-user", JSON.stringify({
        id: "volunteer-demo",
        role: "volunteer",
        name: "Volunteer User",
        email: email,
        phone: "+91-8888888888",
        verified: true
      }));
      window.location.href = "http://localhost:8080/dashboard/volunteer";
    } else if (email === credentials.vip.email && password === credentials.vip.password) {
      // VIP login
      console.log('⭐ VIP login successful, going to VIP dashboard');
      localStorage.setItem("kumbh-user", JSON.stringify({
        id: "vip-demo",
        role: "vip",
        name: "VIP User",
        email: email,
        phone: "+91-9999999999",
        verified: true
      }));
      window.location.href = "http://localhost:8080/dashboard/vip";
    } else if (email === credentials.admin.email && password === credentials.admin.password) {
      // Admin login
      console.log('👨‍💼 Admin login successful, going to admin panel');
      localStorage.setItem("kumbh-user", JSON.stringify({
        id: "admin-demo",
        role: "admin",
        name: "Admin User",
        email: email,
        phone: "+91-9999999999",
        verified: true
      }));
      window.location.href = "http://localhost:8080/admin";
    } else {
      console.log('❌ Invalid credentials');
      alert("Invalid credentials. Please click on one of the demo credentials below to auto-fill the form, or use:\n• Pilgrim: pilgrimroshan@gmail.com / Devotee@2025\n• Volunteer: volunteerkalkin@gmail.com / Volunteer@2025\n• VIP: vipashfaq@gmail.com / VipAccess@2025\n• Admin: adminkeshava@gmail.com / KumbhAdmin@2025");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-blue-500 to-green-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
        <Card className="rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <CardHeader className="text-center pb-6">
            {/* Om/Mandala SVG Icon */}
            <div className="flex justify-center mb-6">
              <div className="animate-spin-slow">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 100 100"
                  className="text-orange-500"
                >
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                  <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7"/>
                  <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="5" fill="currentColor"/>
                  {/* Decorative elements */}
                  <g transform="translate(50,50)">
                    {[...Array(8)].map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1="-40"
                        x2="0"
                        y2="-30"
                        stroke="currentColor"
                        strokeWidth="2"
                        transform={`rotate(${i * 45})`}
                        opacity="0.6"
                      />
                    ))}
                  </g>
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sign In to KumbhYatra
            </h1>
            
            {/* Subtitle */}
            <p className="text-gray-600 text-base">
              Continue your spiritual journey.
            </p>
          </CardHeader>
          
          <CardContent className="px-6 pb-8">
            <form onSubmit={handleLogin} data-testid="login-form" className="space-y-6">
              {/* Email Input */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password"
                  required
                />
              </div>

              {/* Login Button */}
              <Button 
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] text-white shadow-md hover:shadow-lg transition-all duration-200 text-base font-medium border-0"
                data-testid="login-submit"
              >
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <Button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:scale-[1.02] shadow-md hover:shadow-lg transition-all duration-200 text-base font-medium"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>

              {/* Demo Admin Login Button */}
              <Button 
                type="button"
                onClick={() => {
                  console.log('👨‍💼 Quick Admin login, going to admin panel');
                  localStorage.setItem("kumbh-user", JSON.stringify({
                    id: "admin-demo",
                    role: "admin",
                    name: "Admin User",
                    email: "admin@kumbh.com",
                    phone: "+91-9999999999",
                    verified: true
                  }));
                  window.location.href = "http://localhost:8080/admin";
                }}
                className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-[1.02] text-white shadow-md hover:shadow-lg transition-all duration-200 text-base font-medium border-0"
              >
                <span className="mr-3">👨‍💼</span>
                Quick Admin Login (Demo)
              </Button>
            </form>

            {/* Demo Access Credentials */}
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔑</span>
                <h3 className="text-sm font-semibold text-gray-700">Demo Access Credentials</h3>
              </div>
              <div className="space-y-2">
                {/* Pilgrim Credential */}
                <div 
                  className="flex items-center justify-between p-2 bg-white rounded border hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => fillCredentials("pilgrimroshan@gmail.com", "Devotee@2025")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Pilgrim:</span>
                    <span className="text-xs text-gray-600">pilgrimroshan@gmail.com</span>
                  </div>
                  <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">Devotee@2025</span>
                </div>

                {/* VIP Credential */}
                <div 
                  className="flex items-center justify-between p-2 bg-white rounded border hover:bg-purple-50 cursor-pointer transition-colors"
                  onClick={() => fillCredentials("vipashfaq@gmail.com", "VipAccess@2025")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">VIP:</span>
                    <span className="text-xs text-gray-600">vipashfaq@gmail.com</span>
                  </div>
                  <span className="text-xs font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">VipAccess@2025</span>
                </div>

                {/* Volunteer Credential */}
                <div 
                  className="flex items-center justify-between p-2 bg-white rounded border hover:bg-green-50 cursor-pointer transition-colors"
                  onClick={() => fillCredentials("volunteerkalkin@gmail.com", "Volunteer@2025")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Volunteer:</span>
                    <span className="text-xs text-gray-600">volunteerkalkin@gmail.com</span>
                  </div>
                  <span className="text-xs font-mono text-green-600 bg-green-100 px-2 py-1 rounded">Volunteer@2025</span>
                </div>

                {/* Admin Credential */}
                <div 
                  className="flex items-center justify-between p-2 bg-white rounded border hover:bg-red-50 cursor-pointer transition-colors"
                  onClick={() => fillCredentials("adminkeshava@gmail.com", "KumbhAdmin@2025")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Admin:</span>
                    <span className="text-xs text-gray-600">adminkeshava@gmail.com</span>
                  </div>
                  <span className="text-xs font-mono text-red-600 bg-red-100 px-2 py-1 rounded">KumbhAdmin@2025</span>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="text-center pt-2">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link 
                  to="/auth/register" 
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
                >
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KumbhYatraLogin;