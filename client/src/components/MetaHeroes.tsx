import { useQuery } from "@tanstack/react-query";
import { Loader2, Crown, TrendingUp, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import type { Hero } from "@shared/schema";

interface MetaHeroData {
  heroId: string;
  tier: "S" | "A" | "B";
  reason: string;
}

interface MetaHeroesResponse {
  heroes: MetaHeroData[];
  lastUpdated: string;
  season: string;
}

interface MetaHeroesProps {
  heroes: Hero[];
}

const tierColors = {
  S: {
    bg: "bg-gradient-to-br from-amber-500/20 to-orange-600/20",
    border: "border-amber-500/50",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    badge: "bg-amber-500",
  },
  A: {
    bg: "bg-gradient-to-br from-purple-500/20 to-violet-600/20",
    border: "border-purple-500/50",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
    badge: "bg-purple-500",
  },
  B: {
    bg: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20",
    border: "border-blue-500/50",
    text: "text-blue-400",
    glow: "shadow-blue-500/20",
    badge: "bg-blue-500",
  },
};

function HeroThumbnail({ hero, metaData, index }: { hero: Hero; metaData: MetaHeroData; index: number }) {
  const colors = tierColors[metaData.tier];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative group rounded-xl ${colors.bg} border ${colors.border} p-2 transition-all duration-300 hover:scale-105 shadow-lg ${colors.glow}`}
      data-testid={`hero-meta-${hero.id}`}
    >
      <div className="absolute -top-2 -right-2 z-10">
        <span className={`${colors.badge} text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg`}>
          {metaData.tier}
        </span>
      </div>
      
      <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto rounded-lg overflow-hidden bg-background/50">
        <img
          src={hero.image}
          alt={hero.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${hero.name}&background=1a1a2e&color=00ffff&size=80`;
          }}
        />
      </div>
      
      <div className="mt-2 text-center">
        <p className={`text-xs font-bold ${colors.text} truncate`}>{hero.nameAr}</p>
        <p className="text-[10px] text-muted-foreground truncate">{hero.roleAr}</p>
      </div>
      
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/95 rounded-xl p-2 flex flex-col justify-center">
        <p className="text-xs text-center leading-relaxed">{metaData.reason}</p>
      </div>
    </motion.div>
  );
}

export function MetaHeroes({ heroes }: MetaHeroesProps) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<MetaHeroesResponse>({
    queryKey: ["/api/meta-heroes"],
    staleTime: 24 * 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6" data-testid="section-meta-loading">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
          <span className="text-muted-foreground">جاري تحميل أبطال الميتا...</span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const sTier = data.heroes.filter((h) => h.tier === "S");
  const aTier = data.heroes.filter((h) => h.tier === "A");
  const bTier = data.heroes.filter((h) => h.tier === "B");

  const getHeroById = (heroId: string) => heroes.find((h) => h.id === heroId);

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6" data-testid="section-meta-heroes">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">أبطال الميتا</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              {data.season} - {data.lastUpdated}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          data-testid="button-refresh-meta"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">S-Tier</span>
            <span className="text-xs text-muted-foreground">الأقوى حالياً</span>
          </div>
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {sTier.map((metaHero, index) => {
              const hero = getHeroById(metaHero.heroId);
              if (!hero) return null;
              return <HeroThumbnail key={hero.id} hero={hero} metaData={metaHero} index={index} />;
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">A-Tier</span>
            <span className="text-xs text-muted-foreground">قوي جداً</span>
          </div>
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {aTier.map((metaHero, index) => {
              const hero = getHeroById(metaHero.heroId);
              if (!hero) return null;
              return <HeroThumbnail key={hero.id} hero={hero} metaData={metaHero} index={index + 5} />;
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">B-Tier</span>
            <span className="text-xs text-muted-foreground">خيار ممتاز</span>
          </div>
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {bTier.map((metaHero, index) => {
              const hero = getHeroById(metaHero.heroId);
              if (!hero) return null;
              return <HeroThumbnail key={hero.id} hero={hero} metaData={metaHero} index={index + 10} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
