import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface WelcomeProps {
  onEnter: () => void;
}

export default function Welcome({ onEnter }: WelcomeProps) {
  const [, setLocation] = useLocation();

  const handleEnter = () => {
    onEnter();
    setLocation("/app");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" data-testid="page-welcome">
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{
              textShadow: "0 0 20px rgba(0, 243, 255, 0.5), 0 0 40px rgba(0, 243, 255, 0.3)",
            }}
          >
            مرحباً بك في عالم الأساطير
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-12">
            أداتك الذكية لاحتراف Mobile Legends
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Button
            onClick={handleEnter}
            size="lg"
            className="px-12 py-6 text-xl bg-gradient-to-r from-neon-cyan to-neon-green hover:opacity-90 text-black font-bold rounded-2xl shadow-lg"
            style={{
              boxShadow: "0 0 30px rgba(0, 243, 255, 0.5), 0 0 60px rgba(0, 255, 136, 0.3)",
            }}
            data-testid="button-enter"
          >
            <LogIn className="w-6 h-6 ml-2" />
            الدخول
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
