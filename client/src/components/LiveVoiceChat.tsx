import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mic, MicOff, Volume2, VolumeX, Bot, Loader2, Waves, Sparkles, MessageCircle, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Hero } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface LiveVoiceChatProps {
  heroes: Hero[];
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export function LiveVoiceChat({ heroes }: LiveVoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [shouldContinueListening, setShouldContinueListening] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);
  const shouldContinueListeningRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    shouldContinueListeningRef.current = shouldContinueListening;
  }, [shouldContinueListening]);

  const startRecognition = useCallback(() => {
    if (recognitionRef.current && shouldContinueListeningRef.current && !isSpeakingRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setTimeout(() => {
          if (shouldContinueListeningRef.current && !isSpeakingRef.current) {
            startRecognition();
          }
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }
    
    synthRef.current = window.speechSynthesis;
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "ar-SA";

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      setTranscript(finalTranscript || interimTranscript);
      
      if (finalTranscript && finalTranscript.trim().length > 0) {
        handleSendMessage(finalTranscript);
        setTranscript("");
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (shouldContinueListeningRef.current && !isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 100);
      }
    };

    recognitionRef.current.onerror = (event: Event) => {
      console.log("Speech recognition error:", event);
      setIsListening(false);
      if (shouldContinueListeningRef.current && !isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 500);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [startRecognition]);

  useEffect(() => {
    if (shouldContinueListening && !isListening && !isSpeaking) {
      startRecognition();
    }
  }, [shouldContinueListening, isListening, isSpeaking, startRecognition]);

  const coachMutation = useMutation({
    mutationFn: async (question: string) => {
      const conversationHistory = messages.map(m => ({
        role: m.role === "user" ? "user" : "coach",
        content: m.content
      }));
      const response = await apiRequest("POST", "/api/coach", {
        question,
        conversationHistory,
      });
      return await response.json() as { response: string; heroMentioned?: string };
    },
    onSuccess: (data, variables) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: variables,
        timestamp: new Date()
      };
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
      
      if (!isMuted) {
        speakResponse(data.response);
      }
    },
    onError: (_, variables) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: variables,
        timestamp: new Date()
      };
      
      const errorMsg = "عذرا، حدث خطأ. يرجى المحاولة مرة أخرى.";
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: errorMsg,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
      
      if (!isMuted) {
        speakResponse(errorMsg);
      }
    },
  });

  const handleSendMessage = useCallback((message: string) => {
    if (message.trim()) {
      coachMutation.mutate(message);
    }
  }, [coachMutation]);

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (shouldContinueListening) {
        setTimeout(() => startRecognition(), 300);
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (shouldContinueListening) {
        setTimeout(() => startRecognition(), 300);
      }
    };
    
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (shouldContinueListening) {
      setShouldContinueListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setShouldContinueListening(true);
      setTranscript("");
      startRecognition();
    }
  };

  const toggleMute = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const clearChat = () => {
    setMessages([]);
    setTranscript("");
  };

  if (!isSupported) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <MicOff className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">المتصفح غير مدعوم</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          عذرا، متصفحك لا يدعم خاصية التحدث الصوتي. يرجى استخدام متصفح Chrome أو Edge للحصول على أفضل تجربة.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`relative p-3 rounded-2xl transition-all duration-500 ${
            shouldContinueListening 
              ? "bg-neon-green/20 neon-border-green" 
              : "bg-white/5 border border-white/10"
          }`}>
            <Waves className={`w-6 h-6 ${shouldContinueListening ? "text-neon-green animate-pulse" : "text-white/50"}`} />
            {shouldContinueListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full animate-ping" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">المحادثة الصوتية المباشرة</h2>
            <p className="text-sm text-muted-foreground">
              {shouldContinueListening 
                ? isListening 
                  ? "جاري الاستماع..." 
                  : isSpeaking 
                    ? "المدرب يتحدث..." 
                    : "جاري التحضير..."
                : "اضغط على الميكروفون للبدء"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
              data-testid="button-clear-chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-xl transition-all duration-300 ${
              isMuted
                ? "bg-red-500/20 border border-red-500/50 text-red-400"
                : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
            }`}
            data-testid="button-toggle-mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="relative mb-6">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                  shouldContinueListening
                    ? isListening
                      ? "bg-neon-green/20 neon-border-green neon-glow-green"
                      : isSpeaking
                        ? "bg-neon-magenta/20 neon-border-magenta neon-glow-magenta"
                        : "bg-neon-cyan/20 neon-border-cyan"
                    : "bg-white/5 border-2 border-dashed border-white/20"
                }`}>
                  {coachMutation.isPending ? (
                    <Loader2 className="w-14 h-14 text-neon-cyan animate-spin" />
                  ) : isSpeaking ? (
                    <Bot className="w-14 h-14 text-neon-magenta" />
                  ) : shouldContinueListening ? (
                    <Mic className="w-14 h-14 text-neon-green animate-pulse" />
                  ) : (
                    <MessageCircle className="w-14 h-14 text-white/30" />
                  )}
                </div>
                
                {isListening && (
                  <>
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-neon-green/50"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute inset-0 rounded-full border border-neon-green/30"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                  </>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-2">
                {shouldContinueListening ? "أنا أستمع إليك..." : "ابدأ المحادثة الصوتية"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {shouldContinueListening 
                  ? "تحدث بسؤالك وسأرد عليك صوتيا. الميكروفون مفعل ولن يتوقف تلقائيا."
                  : "اضغط على زر الميكروفون أدناه للبدء في المحادثة الصوتية مع المدرب الذكي"}
              </p>
              
              {transcript && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 glass p-3 rounded-xl max-w-md"
                >
                  <p className="text-sm text-neon-green">{transcript}</p>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] ${message.role === "user" ? "order-1" : "order-2"}`}>
                      <div className={`flex items-start gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === "user" 
                            ? "bg-neon-cyan/20 border border-neon-cyan/50" 
                            : "bg-neon-magenta/20 border border-neon-magenta/50"
                        }`}>
                          {message.role === "user" ? (
                            <Mic className="w-4 h-4 text-neon-cyan" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-neon-magenta" />
                          )}
                        </div>
                        
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-neon-cyan/10 border border-neon-cyan/30"
                            : "bg-neon-magenta/10 border border-neon-magenta/30"
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 opacity-60">
                            {message.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {coachMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 bg-neon-magenta/10 border border-neon-magenta/30 rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 text-neon-magenta animate-spin" />
                    <span className="text-sm text-neon-magenta">المدرب يفكر...</span>
                  </div>
                </motion.div>
              )}
              
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div className="bg-neon-green/10 border border-neon-green/30 rounded-2xl px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-neon-green animate-pulse">{transcript}...</p>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4">
            <motion.button
              onClick={toggleListening}
              disabled={coachMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-5 rounded-full transition-all duration-300 ${
                shouldContinueListening
                  ? "bg-neon-green neon-glow-green text-background"
                  : "bg-neon-green/20 neon-border-green text-neon-green hover:bg-neon-green/30"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              data-testid="button-toggle-listening"
            >
              {shouldContinueListening ? (
                <MicOff className="w-7 h-7" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
              
              {isListening && (
                <>
                  <motion.span 
                    className="absolute inset-0 rounded-full border-2 border-neon-green"
                    animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.span 
                    className="absolute inset-0 rounded-full border border-neon-green"
                    animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                </>
              )}
            </motion.button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {shouldContinueListening 
                  ? "اضغط لإيقاف الاستماع" 
                  : "اضغط للتحدث"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
