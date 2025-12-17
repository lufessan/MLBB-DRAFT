import { Gamepad2, MessageCircle, Radio } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  activeTab: "draft" | "coach" | "live";
  onTabChange: (tab: "draft" | "coach" | "live") => void;
}

function Logo3D() {
  return (
    <motion.div 
      className="relative w-12 h-12"
      whileHover={{ rotateY: 15, rotateX: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
      style={{ perspective: "500px" }}
    >
      <div 
        className="w-full h-full rounded-xl bg-gradient-to-br from-neon-cyan via-neon-green to-neon-cyan p-0.5"
        style={{
          transformStyle: "preserve-3d",
          boxShadow: `
            0 0 20px rgba(0, 255, 255, 0.4),
            0 0 40px rgba(0, 255, 255, 0.2),
            0 5px 15px rgba(0, 0, 0, 0.3),
            inset 0 -2px 10px rgba(0, 0, 0, 0.2)
          `
        }}
      >
        <div 
          className="w-full h-full rounded-xl bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center relative overflow-hidden"
          style={{
            transform: "translateZ(10px)",
          }}
        >
          {/* Shield shape */}
          <svg viewBox="0 0 40 44" className="w-8 h-8" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
            {/* Outer shield glow */}
            <defs>
              <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffff" />
                <stop offset="50%" stopColor="#00ff88" />
                <stop offset="100%" stopColor="#00ffff" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Shield body */}
            <path 
              d="M20 2 L36 8 L36 22 C36 32 28 40 20 42 C12 40 4 32 4 22 L4 8 Z" 
              fill="url(#shieldGradient)"
              filter="url(#glow)"
              opacity="0.9"
            />
            
            {/* Inner shield */}
            <path 
              d="M20 6 L32 10.5 L32 22 C32 30 26 36 20 38 C14 36 8 30 8 22 L8 10.5 Z" 
              fill="rgba(0,0,0,0.4)"
            />
            
            {/* ML letters */}
            <text 
              x="20" 
              y="26" 
              textAnchor="middle" 
              fill="url(#shieldGradient)"
              fontSize="10"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
              filter="url(#glow)"
            >
              ML
            </text>
          </svg>
          
          {/* Shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
            animate={{ 
              x: ["-100%", "100%"],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatDelay: 2
            }}
          />
        </div>
      </div>
      
      {/* 3D shadow layers */}
      <div 
        className="absolute inset-0 rounded-xl bg-neon-cyan/30 blur-md -z-10"
        style={{ transform: "translateZ(-5px) translateY(3px)" }}
      />
      <div 
        className="absolute inset-0 rounded-xl bg-neon-green/20 blur-xl -z-20"
        style={{ transform: "translateZ(-10px) translateY(5px)" }}
      />
    </motion.div>
  );
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-50 border-b border-neon-cyan/20">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo3D />
            <div>
              <h1 className="text-xl font-bold neon-text-cyan" data-testid="text-app-title">
                مساعد الدرافت
              </h1>
              <p className="text-xs text-muted-foreground">Mobile Legends</p>
            </div>
          </div>

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
