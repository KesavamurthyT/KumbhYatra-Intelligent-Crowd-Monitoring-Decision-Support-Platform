const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-sacred">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 animate-sacred-glow rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-poppins text-white mb-2">कुंभ यात्रा</h2>
        <p className="text-white/80">Loading your spiritual journey...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;