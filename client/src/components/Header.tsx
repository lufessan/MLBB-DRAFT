import { Gamepad2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import mlLogo from "@assets/13_1765989336653.png";

interface HeaderProps {
  activeTab: "draft" | "coach";
  onTabChange: (tab: "draft" | "coach") => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neon-cyan/20 overflow-hidden">
      <img 
        src={mlLogo} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: "brightness(0.7)",
        }}
        aria-hidden="true"
      />
      <div 
        className="absolute inset-0 bg-background/40"
      />
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0, 255, 255, 0.08) 0%, transparent 50%, rgba(0, 255, 136, 0.08) 100%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <motion.div 
            className="relative flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              src={mlLogo} 
              alt="Mobile Legends Bang Bang" 
              className="relative h-16 md:h-24 w-auto object-contain"
              style={{
                filter: "drop-shadow(0 0 15px rgba(0, 255, 255, 0.5)) drop-shadow(0 0 30px rgba(0, 255, 136, 0.3))"
              }}
              data-testid="img-logo"
            />
          </motion.div>

          <nav className="flex items-center gap-2" data-testid="nav-tabs">
            <button
              onClick={() => onTabChange("draft")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-md ${
                activeTab === "draft"
                  ? "bg-neon-cyan/30 neon-border-cyan text-neon-cyan neon-glow-cyan"
                  : "bg-background/60 border border-white/20 text-white hover:bg-background/80"
              }`}
              data-testid="button-tab-draft"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>مساعد الاختيار</span>
            </button>
            <button
              onClick={() => onTabChange("coach")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-md ${
                activeTab === "coach"
                  ? "bg-neon-magenta/30 neon-border-magenta text-neon-magenta neon-glow-magenta"
                  : "bg-background/60 border border-white/20 text-white hover:bg-background/80"
              }`}
              data-testid="button-tab-coach"
            >
              <MessageCircle className="w-4 h-4" />
              <span>المدرب الذكي</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
