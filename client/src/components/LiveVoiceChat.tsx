import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Trash2 } from "lucide-react";
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

type AvatarMood = "idle" | "listening" | "thinking" | "speaking" | "happy" | "excited";

function ReactiveAvatar({ mood, isSpeaking }: { mood: AvatarMood; isSpeaking: boolean }) {
  const getMoodStyles = () => {
    switch (mood) {
      case "listening":
        return {
          bgColor: "from-neon-green/30 to-neon-cyan/30",
          borderColor: "border-neon-green",
          glowColor: "neon-glow-green",
          eyeColor: "bg-neon-green",
          mouthStyle: "happy"
        };
      case "thinking":
        return {
          bgColor: "from-neon-cyan/30 to-neon-magenta/30",
          borderColor: "border-neon-cyan",
          glowColor: "neon-glow-cyan",
          eyeColor: "bg-neon-cyan",
          mouthStyle: "thinking"
        };
      case "speaking":
        return {
          bgColor: "from-neon-magenta/30 to-neon-orange/30",
          borderColor: "border-neon-magenta",
          glowColor: "neon-glow-magenta",
          eyeColor: "bg-neon-magenta",
          mouthStyle: "speaking"
        };
      case "happy":
        return {
          bgColor: "from-neon-green/40 to-neon-cyan/40",
          borderColor: "border-neon-green",
          glowColor: "neon-glow-green",
          eyeColor: "bg-neon-green",
          mouthStyle: "smile"
        };
      case "excited":
        return {
          bgColor: "from-neon-orange/30 to-neon-magenta/30",
          borderColor: "border-neon-orange",
          glowColor: "",
          eyeColor: "bg-neon-orange",
          mouthStyle: "excited"
        };
      default:
        return {
          bgColor: "from-white/10 to-white/5",
          borderColor: "border-white/20",
          glowColor: "",
          eyeColor: "bg-white/50",
          mouthStyle: "neutral"
        };
    }
  };

  const styles = getMoodStyles();

  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: mood === "speaking" ? [1, 1.05, 1] : mood === "listening" ? [1, 1.02, 1] : 1,
        }}
        transition={{
          duration: mood === "speaking" ? 0.3 : 1,
          repeat: mood === "speaking" || mood === "listening" ? Infinity : 0,
        }}
        className={`w-40 h-40 rounded-full bg-gradient-to-br ${styles.bgColor} border-2 ${styles.borderColor} ${styles.glowColor} flex items-center justify-center relative overflow-visible`}
      >
        {/* Face container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Eyes */}
          <div className="absolute top-12 flex gap-8">
            {/* Left eye */}
            <motion.div
              animate={{
                scaleY: mood === "speaking" ? [1, 0.8, 1] : mood === "happy" ? 0.3 : 1,
              }}
              transition={{ duration: 0.2, repeat: mood === "speaking" ? Infinity : 0 }}
              className={`w-5 h-5 rounded-full ${styles.eyeColor}`}
            >
              {/* Pupil */}
              <motion.div
                animate={{
                  x: mood === "thinking" ? [0, 2, 0, -2, 0] : 0,
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-background rounded-full absolute top-1.5 left-1.5"
              />
            </motion.div>
            {/* Right eye */}
            <motion.div
              animate={{
                scaleY: mood === "speaking" ? [1, 0.8, 1] : mood === "happy" ? 0.3 : 1,
              }}
              transition={{ duration: 0.2, repeat: mood === "speaking" ? Infinity : 0, delay: 0.1 }}
              className={`w-5 h-5 rounded-full ${styles.eyeColor}`}
            >
              <motion.div
                animate={{
                  x: mood === "thinking" ? [0, 2, 0, -2, 0] : 0,
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-background rounded-full absolute top-1.5 left-1.5"
              />
            </motion.div>
          </div>

          {/* Mouth */}
          <div className="absolute bottom-10">
            {styles.mouthStyle === "speaking" && (
              <motion.div
                animate={{
                  scaleY: [1, 1.5, 0.8, 1.2, 1],
                  scaleX: [1, 0.9, 1.1, 0.95, 1],
                }}
                transition={{ duration: 0.15, repeat: Infinity }}
                className="w-8 h-4 bg-neon-magenta rounded-full"
              />
            )}
            {styles.mouthStyle === "happy" && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-10 h-5 border-b-4 border-neon-green rounded-b-full"
              />
            )}
            {styles.mouthStyle === "thinking" && (
              <motion.div
                animate={{ x: [-2, 2, -2] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-6 h-1 bg-neon-cyan rounded-full"
              />
            )}
            {styles.mouthStyle === "neutral" && (
              <div className="w-6 h-1 bg-white/30 rounded-full" />
            )}
            {styles.mouthStyle === "smile" && (
              <div className="w-10 h-5 border-b-4 border-neon-green rounded-b-full" />
            )}
            {styles.mouthStyle === "excited" && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
                className="w-6 h-6 bg-neon-orange rounded-full"
              />
            )}
          </div>

          {/* Cheeks when happy */}
          {(mood === "happy" || mood === "speaking") && (
            <>
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute top-16 left-4 w-4 h-2 bg-pink-400/40 rounded-full blur-sm"
              />
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                className="absolute top-16 right-4 w-4 h-2 bg-pink-400/40 rounded-full blur-sm"
              />
            </>
          )}
        </div>
      </motion.div>

      {/* Sound waves when speaking */}
      {isSpeaking && (
        <>
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-neon-magenta/50"
          />
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            className="absolute inset-0 rounded-full border border-neon-magenta/30"
          />
        </>
      )}

      {/* Listening indicator */}
      {mood === "listening" && (
        <>
          <motion.div
            animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-neon-green/50"
          />
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="absolute inset-0 rounded-full border border-neon-green/30"
          />
        </>
      )}
    </div>
  );
}

export function LiveVoiceChat({ heroes }: LiveVoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [shouldContinueListening, setShouldContinueListening] = useState(false);
  const [avatarMood, setAvatarMood] = useState<AvatarMood>("idle");
  const [hasArabicVoice, setHasArabicVoice] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);
  const shouldContinueListeningRef = useRef(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
    if (isSpeaking) {
      setAvatarMood("speaking");
    }
  }, [isSpeaking]);

  useEffect(() => {
    shouldContinueListeningRef.current = shouldContinueListening;
  }, [shouldContinueListening]);

  useEffect(() => {
    if (isListening) {
      setAvatarMood("listening");
    } else if (!isSpeaking && !isListening && shouldContinueListening) {
      setAvatarMood("idle");
    }
  }, [isListening, isSpeaking, shouldContinueListening]);

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
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      const arabicVoice = voices.find(voice => 
        voice.lang.startsWith('ar') || 
        voice.name.toLowerCase().includes('arab') ||
        voice.name.toLowerCase().includes('arabic')
      );
      setHasArabicVoice(!!arabicVoice);
      
      if (!arabicVoice && voices.length > 0) {
        console.warn("No Arabic voice found. Available voices:", voices.map(v => `${v.name} (${v.lang})`));
      }
    };

    if (window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
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
      setAvatarMood("thinking");
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
      setAvatarMood("happy");
      
      if (!isMuted) {
        speakResponse(data.response);
      } else {
        setTimeout(() => setAvatarMood("idle"), 2000);
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
      setAvatarMood("idle");
      
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

  const getArabicVoice = useCallback(() => {
    const voices = synthRef.current?.getVoices() || availableVoices;
    
    const arabicVoice = voices.find(voice => 
      voice.lang.startsWith('ar') || 
      voice.name.toLowerCase().includes('arab') ||
      voice.name.toLowerCase().includes('arabic')
    );
    
    if (arabicVoice) return arabicVoice;
    
    const googleArabic = voices.find(voice => 
      voice.name.includes('Google') && voice.lang.includes('ar')
    );
    if (googleArabic) return googleArabic;
    
    return voices.find(voice => voice.default) || voices[0] || null;
  }, [availableVoices]);

  const speakResponse = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const selectedVoice = getArabicVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      console.log("Using voice:", selectedVoice.name, selectedVoice.lang);
    } else {
      utterance.lang = "ar-SA";
      console.log("No specific voice found, using default with lang ar-SA");
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setAvatarMood("speaking");
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setAvatarMood("happy");
      setTimeout(() => {
        if (!isSpeakingRef.current) {
          setAvatarMood(shouldContinueListeningRef.current ? "listening" : "idle");
        }
      }, 1500);
      if (shouldContinueListening) {
        setTimeout(() => startRecognition(), 300);
      }
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      setAvatarMood("idle");
      if (shouldContinueListening) {
        setTimeout(() => startRecognition(), 300);
      }
    };
    
    synthRef.current.speak(utterance);
  }, [getArabicVoice, isListening, shouldContinueListening, startRecognition]);

  const toggleListening = () => {
    if (shouldContinueListening) {
      setShouldContinueListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setAvatarMood("idle");
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
    setAvatarMood("idle");
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
            <Mic className={`w-6 h-6 ${shouldContinueListening ? "text-neon-green animate-pulse" : "text-white/50"}`} />
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

      {!hasArabicVoice && !isMuted && (
        <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-200">
          <span className="font-semibold">تنبيه:</span> لا يتوفر صوت عربي في متصفحك. سيتم عرض الردود كتابياً. للحصول على أفضل تجربة صوتية، استخدم متصفح Chrome على الكمبيوتر.
        </div>
      )}

      <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center py-8">
            <ReactiveAvatar mood={avatarMood} isSpeaking={isSpeaking} />
            
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              className="mt-6 text-center"
            >
              <h3 className="text-lg font-semibold mb-1">
                {avatarMood === "idle" && "مرحبا! أنا المدرب الذكي"}
                {avatarMood === "listening" && "أنا أستمع إليك..."}
                {avatarMood === "thinking" && "دقيقة واحدة، أفكر..."}
                {avatarMood === "speaking" && "استمع لنصيحتي..."}
                {avatarMood === "happy" && "هذا رائع!"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {shouldContinueListening 
                  ? "تحدث بسؤالك وسأرد عليك صوتيا"
                  : "اضغط على زر الميكروفون للبدء"}
              </p>
            </motion.div>

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

          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
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
                            <span className="text-xs">AI</span>
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
              
              <div ref={messagesEndRef} />
            </div>
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
