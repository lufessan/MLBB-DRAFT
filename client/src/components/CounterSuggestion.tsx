import { Shield, Swords, Package, BookOpen, Sparkles } from "lucide-react";
import type { CounterSuggestion as CounterSuggestionType } from "@shared/schema";

interface CounterSuggestionProps {
  suggestion: CounterSuggestionType;
}

export function CounterSuggestion({ suggestion }: CounterSuggestionProps) {
  const getHeroInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="glass-card rounded-2xl p-6 neon-glow-green" data-testid="card-counter-suggestion">
      <div className="flex items-start gap-6 mb-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-green/30 to-neon-cyan/30 flex items-center justify-center neon-border-cyan neon-glow-cyan flex-shrink-0">
          <span className="text-3xl font-bold neon-text-cyan">
            {getHeroInitials(suggestion.heroName)}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-neon-green" />
            <span className="text-sm text-neon-green">البطل المقترح</span>
          </div>
          <h2 className="text-2xl font-bold neon-text-cyan mb-1" data-testid="text-hero-name">
            {suggestion.heroNameAr}
          </h2>
          <p className="text-sm text-muted-foreground">{suggestion.heroName}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-base font-bold neon-text-cyan">سبب الاختيار</h3>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90" data-testid="text-reason">
            {suggestion.reason}
          </p>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-5 h-5 text-neon-magenta" />
            <h3 className="text-base font-bold neon-text-magenta">نصائح القتال</h3>
          </div>
          <ul className="space-y-2" data-testid="list-combat-tips">
            {suggestion.combatTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-neon-magenta/20 flex items-center justify-center text-xs text-neon-magenta flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-foreground/90">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-neon-orange" />
            <h3 className="text-base font-bold" style={{ color: "#ff8800", textShadow: "0 0 10px rgba(255, 136, 0, 0.5)" }}>
              البناء الموصى به
            </h3>
          </div>
          <div className="grid gap-3" data-testid="section-build">
            <div>
              <span className="text-xs text-muted-foreground block mb-1.5">العناصر</span>
              <div className="flex flex-wrap gap-2">
                {suggestion.build.items.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-lg bg-neon-orange/10 border border-neon-orange/30 text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-muted-foreground block mb-1.5">الشعار</span>
                <div className="px-3 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-sm">
                  {suggestion.build.emblem}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1.5">الموهبة</span>
                <div className="px-3 py-2 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30 text-sm">
                  {suggestion.build.emblemTalent}
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1.5">ترتيب المهارات</span>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neon-green" />
                <span className="text-sm">{suggestion.build.skillOrder}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
