import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { SnowCanvas } from "@/components/SnowCanvas";
import { Header } from "@/components/Header";
import { DraftAssistant } from "@/components/DraftAssistant";
import { GeminiCoach } from "@/components/GeminiCoach";
import { GeminiLiveChat } from "@/components/GeminiLiveChat";
import { MetaHeroes } from "@/components/MetaHeroes";
import type { ChampionsData } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"draft" | "coach" | "chat">("draft");

  const { data: championsData, isLoading, isError } = useQuery<ChampionsData>({
    queryKey: ["/api/heroes"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <SnowCanvas />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-neon-cyan" />
          <p className="text-lg neon-text-cyan">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (isError || !championsData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <SnowCanvas />
        <div className="relative z-10 glass-card rounded-2xl p-8 text-center max-w-md">
          <p className="text-lg text-red-400 mb-4">حدث خطأ في تحميل البيانات</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-xl bg-neon-cyan/20 neon-border-cyan text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="page-home">
      <SnowCanvas />
      <div className="relative z-10">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          {activeTab === "draft" && (
            <div className="space-y-6">
              <DraftAssistant heroes={championsData.heroes} lanes={championsData.lanes} />
              <MetaHeroes heroes={championsData.heroes} />
            </div>
          )}
          {activeTab === "coach" && (
            <GeminiCoach heroes={championsData.heroes} />
          )}
          {activeTab === "chat" && (
            <GeminiLiveChat heroes={championsData.heroes} />
          )}
        </main>
      </div>
    </div>
  );
}
