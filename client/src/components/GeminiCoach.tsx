import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { CoachMessage, Hero } from "@shared/schema";

interface GeminiCoachProps {
  heroes: Hero[];
}

export function GeminiCoach({ heroes }: GeminiCoachProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const coachMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/coach", {
        question,
        conversationHistory: messages,
      });
      return await response.json() as { response: string; heroMentioned?: string };
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "coach", content: data.response, heroMentioned: data.heroMentioned },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "coach", content: "عذراً، حدث خطأ في الاتصال بالمدرب الذكي. يرجى المحاولة مرة أخرى." },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || coachMutation.isPending) return;

    const userMessage: CoachMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    coachMutation.mutate(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getHeroInitials = (name?: string) => {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
  };

  const findHeroByName = (heroName?: string) => {
    if (!heroName) return null;
    return heroes.find(
      (h) =>
        h.name.toLowerCase() === heroName.toLowerCase() ||
        h.nameAr === heroName ||
        h.id === heroName.toLowerCase()
    );
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[600px]" data-testid="section-coach">
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-neon-magenta/10 neon-border-magenta">
          <Bot className="w-5 h-5 text-neon-magenta" />
        </div>
        <div>
          <h2 className="text-lg font-bold neon-text-magenta">المدرب الذكي</h2>
          <p className="text-xs text-muted-foreground">مدعوم بالذكاء الاصطناعي Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom" data-testid="container-messages">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-neon-magenta/10 flex items-center justify-center mb-4 neon-glow-magenta">
              <Sparkles className="w-8 h-8 text-neon-magenta" />
            </div>
            <h3 className="text-lg font-bold mb-2">مرحباً بك في المدرب الذكي</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              اسألني عن أي شيء يتعلق بـ Mobile Legends! يمكنك السؤال عن الأبطال، الاستراتيجيات، 
              الكاونترات، أو نصائح اللعب.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {["كيف ألعب فاني؟", "ما هو كاونتر خوفرا؟", "نصائح للجنغل"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-neon-magenta/10 hover:border-neon-magenta/30 transition-colors"
                  data-testid={`button-suggestion-${suggestion}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const hero = findHeroByName(message.heroMentioned);
          
          return (
            <div
              key={index}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              data-testid={`message-${message.role}-${index}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-neon-cyan/20 neon-border-cyan"
                    : "bg-neon-magenta/20 neon-border-magenta"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-neon-cyan" />
                ) : (
                  <Bot className="w-4 h-4 text-neon-magenta" />
                )}
              </div>
              <div
                className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-left" : "text-right"}`}
              >
                <div
                  className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-neon-cyan/10 border border-neon-cyan/30 rounded-tl-none"
                      : "bg-neon-magenta/10 border border-neon-magenta/30 rounded-tr-none"
                  }`}
                >
                  {message.content}
                </div>
                {hero && message.role === "coach" && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan font-bold">
                      {getHeroInitials(hero.name)}
                    </div>
                    <span className="text-xs">{hero.nameAr}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {coachMutation.isPending && (
          <div className="flex gap-3" data-testid="indicator-loading">
            <div className="w-9 h-9 rounded-full bg-neon-magenta/20 flex items-center justify-center neon-border-magenta">
              <Bot className="w-4 h-4 text-neon-magenta" />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tr-none bg-neon-magenta/10 border border-neon-magenta/30">
              <Loader2 className="w-4 h-4 animate-spin text-neon-magenta" />
              <span className="text-sm text-muted-foreground">يفكر...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-neon-magenta/50 focus:shadow-[0_0_10px_rgba(255,0,255,0.2)] transition-all"
            disabled={coachMutation.isPending}
            data-testid="input-coach-message"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || coachMutation.isPending}
            className="p-3 rounded-xl bg-neon-magenta/20 border border-neon-magenta/50 text-neon-magenta hover:bg-neon-magenta/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all neon-glow-magenta"
            data-testid="button-send-message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
