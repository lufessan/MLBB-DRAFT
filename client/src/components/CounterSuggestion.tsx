import { useEffect } from "react";
import { Shield, Swords, Package, BookOpen, Sparkles, Clock, Target, Zap, TrendingUp, Lightbulb, Trophy } from "lucide-react";
import type { CounterSuggestion as CounterSuggestionType } from "@shared/schema";
import { motion } from "framer-motion";

interface CounterSuggestionProps {
  suggestion: CounterSuggestionType;
  onSpeak?: (text: string) => void;
}

export function CounterSuggestion({ suggestion, onSpeak }: CounterSuggestionProps) {
  useEffect(() => {
    if (onSpeak && suggestion) {
      const text = `البطل المقترح هو ${suggestion.heroNameAr}. ${suggestion.reason}`;
      onSpeak(text);
    }
  }, [suggestion, onSpeak]);
  const getHeroInitials = (name?: string) => {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 neon-glow-green" 
      data-testid="card-counter-suggestion"
    >
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

        {suggestion.gamePhaseTips && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-neon-cyan" />
              <h3 className="text-lg font-bold neon-text-cyan">نصائح مراحل اللعبة</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-3">
              {suggestion.gamePhaseTips.earlyGame && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass p-4 rounded-xl border border-green-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold text-green-400">Early Game</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{suggestion.gamePhaseTips.earlyGame.timing}</p>
                  <p className="text-sm mb-3">{suggestion.gamePhaseTips.earlyGame.strategy}</p>
                  {suggestion.gamePhaseTips.earlyGame.farmTips && suggestion.gamePhaseTips.earlyGame.farmTips.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-green-400">نصائح الفارم:</span>
                      {suggestion.gamePhaseTips.earlyGame.farmTips.map((tip, i) => (
                        <p key={i} className="text-xs text-foreground/70 pr-2">{tip}</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {suggestion.gamePhaseTips.midGame && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass p-4 rounded-xl border border-yellow-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-400">Mid Game</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{suggestion.gamePhaseTips.midGame.timing}</p>
                  <p className="text-sm mb-3">{suggestion.gamePhaseTips.midGame.strategy}</p>
                  {suggestion.gamePhaseTips.midGame.teamFightTiming && (
                    <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <span className="text-xs text-yellow-400 block mb-1">وقت التيم فايت:</span>
                      <p className="text-xs">{suggestion.gamePhaseTips.midGame.teamFightTiming}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {suggestion.gamePhaseTips.lateGame && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass p-4 rounded-xl border border-red-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold text-red-400">Late Game</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{suggestion.gamePhaseTips.lateGame.timing}</p>
                  <p className="text-sm mb-3">{suggestion.gamePhaseTips.lateGame.strategy}</p>
                  {suggestion.gamePhaseTips.lateGame.objectivePriority && suggestion.gamePhaseTips.lateGame.objectivePriority.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-red-400">أولوية الأهداف:</span>
                      {suggestion.gamePhaseTips.lateGame.objectivePriority.map((obj, i) => (
                        <p key={i} className="text-xs text-foreground/70 pr-2">{i + 1}. {obj}</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}

        {suggestion.tricks && suggestion.tricks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-4 rounded-xl border border-neon-magenta/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-neon-magenta" />
              <h3 className="text-base font-bold neon-text-magenta">خدع وحيل مميزة</h3>
            </div>
            <div className="grid gap-3">
              {suggestion.tricks.map((trick, index) => (
                <div key={index} className="p-3 rounded-lg bg-neon-magenta/5 border border-neon-magenta/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-neon-magenta" />
                    <span className="text-sm font-semibold text-neon-magenta">{trick.name}</span>
                  </div>
                  <p className="text-sm text-foreground/80 pr-6">{trick.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-neon-orange" />
            <h3 className="text-base font-bold" style={{ color: "#ff8800", textShadow: "0 0 10px rgba(255, 136, 0, 0.5)" }}>
              البناء الموصى به
            </h3>
          </div>
          <div className="grid gap-3" data-testid="section-build">
            <div>
              <span className="text-xs text-muted-foreground block mb-1.5">العناصر (بالترتيب من الأول للأخير)</span>
              <div className="flex flex-wrap gap-2">
                {suggestion.build.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-orange/10 border border-neon-orange/30 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-neon-orange/30 flex items-center justify-center text-[10px] font-bold text-neon-orange flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </div>
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
    </motion.div>
  );
}
