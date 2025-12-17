import { useState, useRef, useEffect } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import type { Hero } from "@shared/schema";

interface HeroSelectorProps {
  heroes: Hero[];
  selectedHeroes: string[];
  onSelect: (heroId: string) => void;
  onRemove: (heroId: string) => void;
  maxSelection?: number;
  placeholder?: string;
  label: string;
}

export function HeroSelector({
  heroes,
  selectedHeroes,
  onSelect,
  onRemove,
  maxSelection = 5,
  placeholder = "ابحث عن بطل...",
  label,
}: HeroSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredHeroes = heroes.filter(
    (hero) =>
      !selectedHeroes.includes(hero.id) &&
      (hero.name.toLowerCase().includes(search.toLowerCase()) ||
        hero.nameAr.includes(search))
  );

  const selectedHeroData = heroes.filter((h) => selectedHeroes.includes(h.id));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getHeroInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm text-muted-foreground mb-2">{label}</label>
      
      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px]">
        {selectedHeroData.map((hero) => (
          <div
            key={hero.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card neon-border-cyan group"
            data-testid={`badge-hero-${hero.id}`}
          >
            <div className="w-7 h-7 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan font-bold">
              {getHeroInitials(hero.name)}
            </div>
            <span className="text-sm">{hero.nameAr}</span>
            <button
              onClick={() => onRemove(hero.id)}
              className="p-0.5 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
              data-testid={`button-remove-hero-${hero.id}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {selectedHeroes.length < maxSelection && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl glass-card border border-white/10 hover:border-neon-cyan/30 transition-all focus:outline-none focus:border-neon-cyan/50 focus:neon-glow-cyan"
          data-testid="button-hero-dropdown"
        >
          <span className="text-muted-foreground">{placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-card rounded-xl overflow-hidden neon-glow-cyan">
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث..."
                className="w-full pr-10 pl-4 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-neon-cyan/50"
                data-testid="input-hero-search"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-custom">
            {filteredHeroes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                لا توجد نتائج
              </div>
            ) : (
              <div className="p-2 grid grid-cols-2 gap-1">
                {filteredHeroes.map((hero) => (
                  <button
                    key={hero.id}
                    onClick={() => {
                      onSelect(hero.id);
                      setSearch("");
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neon-cyan/10 transition-colors text-right"
                    data-testid={`button-select-hero-${hero.id}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/30 to-neon-magenta/30 flex items-center justify-center text-xs font-bold">
                      {getHeroInitials(hero.name)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">{hero.nameAr}</div>
                      <div className="text-xs text-muted-foreground">{hero.roleAr}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
