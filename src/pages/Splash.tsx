import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has completed onboarding
      const hasOnboarded = localStorage.getItem("kumbh-onboarded");
      if (hasOnboarded) {
        navigate("/auth/login");
      } else {
        navigate("/onboarding");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-sacred overflow-hidden">
      <div className="text-center">
        <div className="animate-gentle-float mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-sacred-glow">
            <div className="text-4xl">🕉️</div>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-4 animate-sacred-pulse">
          कुंभ यात्रा
        </h1>
        <p className="text-xl text-white/90 mb-8 font-inter">
          Smart Mobility & Crowd Management
        </p>
        
        <div className="text-white/60 text-sm">
          Connecting pilgrims with divine experience
        </div>
        
        {/* Loading indicator */}
        <div className="mt-8">
          <div className="w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-temple rounded-full animate-pulse w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;