import { Crosshair, Sword, Wand2, Trees, Navigation } from "lucide-react";
import type { Lane } from "@shared/schema";

interface LaneSelectorProps {
  lanes: Lane[];
  selectedLane: string | null;
  onSelect: (laneId: string) => void;
}

const laneIcons: Record<string, typeof Crosshair> = {
  gold: Crosshair,
  exp: Sword,
  mid: Wand2,
  jungle: Trees,
  roam: Navigation,
};

export function LaneSelector({ lanes, selectedLane, onSelect }: LaneSelectorProps) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-3">اختر الممر المفضل</label>
      <div className="grid grid-cols-5 gap-2">
        {lanes.map((lane) => {
          const Icon = laneIcons[lane.id] || Crosshair;
          const isSelected = selectedLane === lane.id;
          
          return (
            <button
              key={lane.id}
              onClick={() => onSelect(lane.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                isSelected
                  ? "bg-neon-cyan/20 neon-border-cyan neon-glow-cyan"
                  : "glass-card border border-white/10 hover:border-neon-cyan/30"
              }`}
              data-testid={`button-lane-${lane.id}`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? "text-neon-cyan" : "text-muted-foreground"}`} />
              <span className={`text-xs ${isSelected ? "text-neon-cyan" : "text-muted-foreground"}`}>
                {lane.nameAr}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
