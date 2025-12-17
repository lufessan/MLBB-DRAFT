import { Gamepad2, MessageCircle, Shield, Radio } from "lucide-react";

interface HeaderProps {
  activeTab: "draft" | "coach" | "live";
  onTabChange: (tab: "draft" | "coach" | "live") => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-50 border-b border-neon-cyan/20">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neon-cyan/10 neon-border-cyan neon-glow-cyan">
              <Shield className="w-6 h-6 text-neon-cyan" />
            </div>
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
