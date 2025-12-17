import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Welcome from "@/pages/Welcome";
import NotFound from "@/pages/not-found";

function BackgroundAudio({ isMuted }: { isMuted: boolean }) {
  return (
    <div 
      className="fixed overflow-hidden pointer-events-none"
      style={{ 
        zIndex: -1,
        width: 1,
        height: 1,
        opacity: 0,
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/ufflAtVLHK0?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=ufflAtVLHK0&controls=0&showinfo=0&rel=0&modestbranding=1&vq=hd720&disablekb=1&fs=0&iv_load_policy=3`}
        title="Background Music"
        style={{
          width: 1,
          height: 1,
          border: "none",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

function AppContent() {
  const [hasEntered, setHasEntered] = useState(() => {
    return sessionStorage.getItem("hasEntered") === "true";
  });
  const [audioStarted, setAudioStarted] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (hasEntered) {
      sessionStorage.setItem("hasEntered", "true");
    }
  }, [hasEntered]);

  useEffect(() => {
    if (location === "/app" && !hasEntered) {
      setHasEntered(true);
      sessionStorage.setItem("hasEntered", "true");
    }
  }, [location, hasEntered]);

  const handleEnter = () => {
    setHasEntered(true);
    setAudioStarted(true);
    setLocation("/app");
  };

  return (
    <>
      {audioStarted && <BackgroundAudio isMuted={false} />}
      <Switch>
        <Route path="/">
          {hasEntered ? <Home /> : <Welcome onEnter={handleEnter} />}
        </Route>
        <Route path="/app" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
