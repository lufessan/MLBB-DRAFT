import { Gamepad2, MessageCircle, Radio } from "lucide-react";
import { motion } from "framer-motion";
import mlLogo from "@assets/13_1765989336653.png";

interface HeaderProps {
  activeTab: "draft" | "coach" | "live";
  onTabChange: (tab: "draft" | "coach" | "live") => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-neon-cyan/20 relative overflow-hidden">
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
              className="relative h-12 md:h-16 w-auto object-contain"
              style={{
                filter: "drop-shadow(0 0 10px rgba(0, 255, 255, 0.4)) drop-shadow(0 0 20px rgba(0, 255, 136, 0.2))"
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
            <button
              onClick={() => onTabChange("live")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-md ${
                activeTab === "live"
                  ? "bg-neon-green/30 neon-border-green text-neon-green neon-glow-green"
                  : "bg-background/60 border border-white/20 text-white hover:bg-background/80"
              }`}
              data-testid="button-tab-live"
            >
              <Radio className="w-4 h-4" />
              <span>LIVE</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
