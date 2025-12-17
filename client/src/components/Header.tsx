import { Gamepad2, MessageCircle, Radio } from "lucide-react";
import { motion } from "framer-motion";
import mlLogo from "@assets/13_1765989336653.png";

interface HeaderProps {
  activeTab: "draft" | "coach" | "live";
  onTabChange: (tab: "draft" | "coach" | "live") => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-neon-cyan/20 bg-background/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <motion.div 
            className="relative flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div 
              className="absolute inset-0 rounded-xl blur-lg opacity-60"
              style={{
                background: "linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 255, 136, 0.2))",
              }}
            />
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                activeTab === "draft"
                  ? "bg-neon-cyan/20 neon-border-cyan text-neon-cyan neon-glow-cyan"
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
              }`}
              data-testid="button-tab-draft"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>مساعد الاختيار</span>
            </button>
            <button
              onClick={() => onTabChange("coach")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                activeTab === "coach"
                  ? "bg-neon-magenta/20 neon-border-magenta text-neon-magenta neon-glow-magenta"
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
              }`}
              data-testid="button-tab-coach"
            >
              <MessageCircle className="w-4 h-4" />
              <span>المدرب الذكي</span>
            </button>
            <button
              onClick={() => onTabChange("live")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                activeTab === "live"
                  ? "bg-neon-green/20 neon-border-green text-neon-green neon-glow-green"
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
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
