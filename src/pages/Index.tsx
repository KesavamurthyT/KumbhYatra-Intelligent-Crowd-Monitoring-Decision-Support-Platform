import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if reset parameter is provided to clear localStorage
    if (searchParams.get('reset') === 'true') {
      localStorage.clear();
      console.log('🔄 localStorage cleared - starting fresh flow');
    }

    // Redirect to appropriate page based on user state
    const hasOnboarded = localStorage.getItem("kumbh-onboarded");
    const user = localStorage.getItem("kumbh-user");
    
    console.log('🔍 Flow Check:', {
      hasUser: !!user,
      hasOnboarded: !!hasOnboarded,
      nextRoute: user ? '/dashboard' : hasOnboarded ? '/auth/login' : '/onboarding'
    });
    
    if (user) {
      const userData = JSON.parse(user);
      console.log('👤 User found:', userData.role);
      if (userData.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else if (hasOnboarded) {
      console.log('📝 Onboarding completed, going to login');
      navigate("/auth/login");
    } else {
      console.log('🎯 New user, starting onboarding');
      navigate("/onboarding");
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-sacred">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 animate-sacred-glow rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-poppins text-white mb-2">कुंभ यात्रा</h2>
        <p className="text-white/80">Redirecting...</p>
        <div className="mt-4">
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="text-white/60 hover:text-white/80 text-sm underline"
          >
            🔄 Start Fresh (Clear Data)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
