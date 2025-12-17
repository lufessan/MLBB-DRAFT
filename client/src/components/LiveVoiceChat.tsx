import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mic, MicOff, Volume2, VolumeX, Bot, Loader2, Radio } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Hero } from "@shared/schema";

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

export function LiveVoiceChat({ heroes }: LiveVoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }
    
    synthRef.current = window.speechSynthesis;
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = false;
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
      
      if (finalTranscript) {
        handleSendMessage(finalTranscript);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const coachMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/coach", {
        question,
        conversationHistory,
      });
      return await response.json() as { response: string; heroMentioned?: string };
    },
    onSuccess: (data) => {
      setAiResponse(data.response);
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: transcript },
        { role: "coach", content: data.response }
      ]);
      
      if (!isMuted) {
        speakResponse(data.response);
      }
    },
    onError: () => {
      const errorMsg = "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.";
      setAiResponse(errorMsg);
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
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setAiResponse("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleMute = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  if (!isSupported) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <MicOff className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">المتصفح غير مدعوم</h2>
        <p className="text-muted-foreground">
          عذراً، متصفحك لا يدعم خاصية التحدث الصوتي. يرجى استخدام متصفح Chrome أو Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-neon-green/10 neon-border-green animate-pulse">
          <Radio className="w-5 h-5 text-neon-green" />
        </div>
        <div>
          <h2 className="text-lg font-bold neon-text-green">المحادثة المباشرة</h2>
          <p className="text-xs text-muted-foreground">تحدث مع المدرب الذكي صوتياً</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
          isListening 
            ? "bg-neon-green/20 neon-border-green neon-glow-green animate-pulse" 
            : isSpeaking
            ? "bg-neon-magenta/20 neon-border-magenta neon-glow-magenta"
            : "bg-white/5 border border-white/20"
        }`}>
          {coachMutation.isPending ? (
            <Loader2 className="w-16 h-16 text-neon-cyan animate-spin" />
          ) : isSpeaking ? (
            <Bot className="w-16 h-16 text-neon-magenta animate-bounce" />
          ) : (
            <Mic className={`w-16 h-16 ${isListening ? "text-neon-green" : "text-white/50"}`} />
          )}
          
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-neon-green/50 animate-ping" />
              <div className="absolute inset-0 rounded-full border border-neon-green/30 animate-pulse" style={{ animationDelay: "0.2s" }} />
            </>
          )}
        </div>

        <div className="text-center space-y-2 min-h-[80px]">
          {isListening && (
            <p className="text-neon-green animate-pulse">جاري الاستماع...</p>
          )}
          {transcript && (
            <div className="glass p-3 rounded-xl max-w-md">
              <p className="text-sm text-foreground/80">{transcript}</p>
            </div>
          )}
          {coachMutation.isPending && (
            <p className="text-neon-cyan">المدرب يفكر...</p>
          )}
        </div>

        {aiResponse && !coachMutation.isPending && (
          <div className="glass p-4 rounded-xl max-w-md text-center border border-neon-magenta/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-neon-magenta" />
              <span className="text-xs text-neon-magenta">رد المدرب</span>
            </div>
            <p className="text-sm leading-relaxed">{aiResponse}</p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={toggleListening}
            disabled={coachMutation.isPending || isSpeaking}
            className={`p-6 rounded-full transition-all duration-300 ${
              isListening
                ? "bg-neon-green neon-glow-green text-background"
                : "bg-neon-green/20 neon-border-green text-neon-green hover:bg-neon-green/30"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
          
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-300 ${
              isMuted
                ? "bg-red-500/20 border border-red-500/50 text-red-400"
                : "bg-white/5 border border-white/20 text-white/70 hover:bg-white/10"
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-sm">
          اضغط على زر الميكروفون وتحدث بسؤالك. سيرد عليك المدرب الذكي صوتياً.
        </p>
      </div>
    </div>
  );
}
