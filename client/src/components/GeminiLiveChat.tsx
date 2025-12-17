import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import type { Hero } from "@shared/schema";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface GeminiLiveChatProps {
  heroes: Hero[];
}

export function GeminiLiveChat({ heroes }: GeminiLiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "مرحباً بك في الخبير الأسطوري! أنا هنا لمساعدتك في كل ما يتعلق بـ Mobile Legends. اسألني عن الأبطال، الاستراتيجيات، البناء، أو أي شيء آخر!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const heroNames = heroes.map((h) => h.name).join(", ");
      const response = await apiRequest("POST", "/api/gemini/chat", {
        message: input.trim(),
        context: `أنت خبير في لعبة Mobile Legends Bang Bang. الأبطال المتاحين: ${heroNames}. أجب باللغة العربية بشكل مفيد ومختصر.`,
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "عذراً، حدث خطأ. حاول مرة أخرى.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "عذراً، حدث خطأ في الاتصال. تأكد من إعداد مفتاح Gemini API وحاول مرة أخرى.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden" data-testid="gemini-live-chat">
      <div className="p-4 border-b border-neon-purple/30 bg-gradient-to-r from-neon-purple/10 to-neon-magenta/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">الخبير الأسطوري</h2>
            <p className="text-sm text-white/60">تحدث مباشرة مع الذكاء الاصطناعي</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "user"
                      ? "bg-neon-cyan/20 text-neon-cyan"
                      : "bg-gradient-to-br from-neon-purple to-neon-magenta text-white"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-neon-cyan/10 border border-neon-cyan/30 text-white"
                      : "bg-white/5 border border-white/10 text-white/90"
                  }`}
                  style={{ direction: "rtl" }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                <p className="text-sm text-white/60">جاري الكتابة...</p>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 min-h-[44px] max-h-32 resize-none bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-neon-purple/50 focus:ring-neon-purple/20"
            style={{ direction: "rtl" }}
            disabled={isLoading}
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-neon-purple to-neon-magenta hover:opacity-90 text-white shrink-0"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
