import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Welcome from "@/pages/Welcome";
import NotFound from "@/pages/not-found";

function BackgroundAudio({ visible }: { visible: boolean }) {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ 
        zIndex: -1,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <div 
        className="absolute"
        style={{
          top: "-60px",
          left: "-60px",
          right: "-60px",
          bottom: "-60px",
        }}
      >
        <iframe
          src="https://www.youtube.com/embed/ufflAtVLHK0?autoplay=1&mute=0&loop=1&playlist=ufflAtVLHK0&controls=0&showinfo=0&rel=0&modestbranding=1&vq=hd720&disablekb=1&fs=0&iv_load_policy=3"
          title="Background Music"
          className="w-full h-full"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(1.2)",
            width: "177.78vh",
            height: "100vh",
            minWidth: "100%",
            minHeight: "56.25vw",
            pointerEvents: "none",
            border: "none",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}

function AppContent() {
  const [hasEntered, setHasEntered] = useState(false);
  const [location] = useLocation();

  const handleEnter = () => {
    setHasEntered(true);
  };

  const showVideoBackground = !hasEntered;

  return (
    <>
      <BackgroundAudio visible={showVideoBackground} />
      <Switch>
        {!hasEntered ? (
          <Route path="/">
            <Welcome onEnter={handleEnter} />
          </Route>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/app" component={Home} />
          </>
        )}
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
