import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { HeroSelector } from "./HeroSelector";
import { LaneSelector } from "./LaneSelector";
import { CounterSuggestion } from "./CounterSuggestion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";
import type { Hero, Lane, CounterSuggestion as CounterSuggestionType } from "@shared/schema";

interface DraftAssistantProps {
  heroes: Hero[];
  lanes: Lane[];
}

export function DraftAssistant({ heroes, lanes }: DraftAssistantProps) {
  const [selectedEnemies, setSelectedEnemies] = useState<string[]>([]);
  const [selectedLane, setSelectedLane] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakText = (text: string) => {
    if (!synthRef.current || isMuted) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.volume = volume / 100;
    utterance.rate = 1.2;
    synthRef.current.speak(utterance);
  };

  const counterMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/counter", {
        enemyHeroes: selectedEnemies,
        preferredLane: selectedLane,
      });
      return await response.json() as CounterSuggestionType;
    },
  });

  const handleGetCounter = () => {
    if (selectedEnemies.length > 0 && selectedLane) {
      counterMutation.mutate();
    }
  };

  const canSubmit = selectedEnemies.length > 0 && selectedLane;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 space-y-6" data-testid="section-draft-input">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neon-cyan/10 neon-border-cyan">
              <Sparkles className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-bold">مساعد اختيار البطل</h2>
              <p className="text-sm text-muted-foreground">أدخل أبطال العدو واختر ممرك للحصول على أفضل كاونتر</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                max={100}
                step={1}
                className="w-20"
                disabled={isMuted}
                data-testid="slider-volume"
              />
              <span className="text-xs text-muted-foreground w-8">{volume}%</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsMuted(!isMuted);
                if (synthRef.current) {
                  synthRef.current.cancel();
                }
              }}
              className={`${isMuted ? "text-red-400" : "text-neon-cyan"}`}
              data-testid="button-mute"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <HeroSelector
          heroes={heroes}
          selectedHeroes={selectedEnemies}
          onSelect={(id) => setSelectedEnemies((prev) => [...prev, id])}
          onRemove={(id) => setSelectedEnemies((prev) => prev.filter((h) => h !== id))}
          maxSelection={5}
          placeholder="اختر أبطال العدو..."
          label="أبطال العدو (حتى 5)"
        />

        <LaneSelector
          lanes={lanes}
          selectedLane={selectedLane}
          onSelect={setSelectedLane}
        />

        <Button
          onClick={handleGetCounter}
          disabled={!canSubmit || counterMutation.isPending}
          className="w-full py-6 text-lg bg-gradient-to-l from-neon-cyan/80 to-neon-green/80 hover:from-neon-cyan hover:to-neon-green text-background font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-get-counter"
        >
          {counterMutation.isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري التحليل...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>احصل على الكاونتر الأفضل</span>
            </div>
          )}
        </Button>
      </div>

      {counterMutation.isError && (
        <div className="glass-card rounded-2xl p-4 border border-red-500/30" data-testid="alert-error">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.</p>
          </div>
        </div>
      )}

      {counterMutation.data && <CounterSuggestion suggestion={counterMutation.data} onSpeak={speakText} />}
    </div>
  );
}
