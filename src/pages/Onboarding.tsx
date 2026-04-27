import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { language, setLanguage, t, getAvailableLanguages } = useTranslation();

  // Dynamic onboarding steps based on current language
  const onboardingSteps = [
    {
      title: t.onboarding.welcome.title,
      subtitle: t.onboarding.welcome.subtitle,
      description: t.onboarding.welcome.description,
      icon: "🕉️",
      features: t.onboarding.welcome.features
    },
    {
      title: t.onboarding.map.title,
      subtitle: t.onboarding.map.subtitle,
      description: t.onboarding.map.description,
      icon: "🗺️",
      features: t.onboarding.map.features
    },
    {
      title: t.onboarding.safety.title,
      subtitle: t.onboarding.safety.subtitle,
      description: t.onboarding.safety.description,
      icon: "📱",
      features: t.onboarding.safety.features
    },
    {
      title: t.onboarding.language.title,
      subtitle: t.onboarding.language.subtitle,
      description: t.onboarding.language.description,
      icon: "🌐",
      features: []
    }
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      console.log(`📱 Onboarding: Step ${currentStep + 1} → ${currentStep + 2}`);
    } else {
      // Complete onboarding
      console.log('✅ Onboarding completed, going to login');
      localStorage.setItem("kumbh-onboarded", "true");
      localStorage.setItem("kumbh-language", language);
      navigate("/auth/login");
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Onboarding skipped, going to login');
    localStorage.setItem("kumbh-onboarded", "true");
    localStorage.setItem("kumbh-language", language);
    navigate("/auth/login");
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen gradient-sacred flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-sacred" data-testid="onboarding-card">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6 animate-gentle-float">
              {currentStepData.icon}
            </div>
            
            <h1 className="text-2xl font-poppins font-bold text-foreground mb-2">
              {currentStepData.title}
            </h1>
            
            <p className="text-saffron font-medium mb-4">
              {currentStepData.subtitle}
            </p>
            
            <p className="text-muted-foreground mb-6">
              {currentStepData.description}
            </p>

            {currentStepData.features.length > 0 && (
              <div className="space-y-2 mb-8">
                {currentStepData.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-foreground">
                    <div className="w-2 h-2 bg-forest rounded-full mr-3"></div>
                    {feature}
                  </div>
                ))}
              </div>
            )}

            {/* Language selection on last step */}
            {currentStep === onboardingSteps.length - 1 && (
              <div className="space-y-3 mb-8">
                {getAvailableLanguages().map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as 'en' | 'hi' | 'mr')}
                    className={`w-full p-3 rounded-lg border-2 transition-sacred ${
                      language === lang.code 
                        ? "border-saffron bg-saffron/10" 
                        : "border-border hover:border-saffron/50"
                    }`}
                  >
                    <div className="font-medium">{lang.native}</div>
                    <div className="text-sm text-muted-foreground">{lang.name}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSkip}
                className="flex-1"
                data-testid="skip-btn"
              >
                {t.common.skip}
              </Button>
              <Button 
                onClick={handleNext}
                className="flex-1 bg-saffron hover:bg-saffron-dark text-white"
                data-testid="next-btn"
              >
                {currentStep === onboardingSteps.length - 1 ? t.common.getStarted : t.common.next}
              </Button>
            </div>

            {/* Progress indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-sacred ${
                    index <= currentStep ? "bg-saffron" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;