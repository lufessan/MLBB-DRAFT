import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Hero } from "@shared/schema";

interface VoiceAssistantProps {
  heroes: Hero[];
}

type AssistantState = "idle" | "listening" | "processing" | "speaking";

export function VoiceAssistant({ heroes }: VoiceAssistantProps) {
  const [state, setState] = useState<AssistantState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
        handleSendMessage(finalTranscript);
      }
    };

    recognition.onerror = () => {
      setState("idle");
    };

    recognition.onend = () => {
      if (state === "listening") {
        setState("idle");
      }
    };

    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;

    return () => {
      recognition.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSendMessage = async (message: string) => {
    setState("processing");
    
    try {
      const heroNames = heroes.map((h) => h.name).join(", ");
      const response = await apiRequest("POST", "/api/gemini/chat", {
        message,
        context: `أنت خبير في لعبة Mobile Legends Bang Bang. الأبطال المتاحين: ${heroNames}. أجب باللغة العربية بشكل مفيد ومختصر. رد بجمل قصيرة مناسبة للقراءة الصوتية.`,
      });

      const data = await response.json();
      const responseText = data.response || "عذراً، حدث خطأ. حاول مرة أخرى.";
      
      setLastResponse(responseText);
      
      if (!isMuted) {
        speakResponse(responseText);
      } else {
        setState("idle");
      }
    } catch (error) {
      const errorMessage = "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.";
      setLastResponse(errorMessage);
      if (!isMuted) {
        speakResponse(errorMessage);
      } else {
        setState("idle");
      }
    }
  };

  const speakResponse = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    setState("speaking");
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(
      (voice) =>
        voice.lang.startsWith("ar") ||
        voice.name.toLowerCase().includes("arab")
    );
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => {
      setState("idle");
    };

    utterance.onerror = () => {
      setState("idle");
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    setTranscript("");
    setState("listening");
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      setState("idle");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState("idle");
  };

  const toggleMute = () => {
    if (!isMuted && state === "speaking") {
      window.speechSynthesis.cancel();
      setState("idle");
    }
    setIsMuted(!isMuted);
  };

  if (!isSupported) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center" data-testid="voice-assistant">
        <p className="text-white/60">
          عذراً، متصفحك لا يدعم التعرف على الصوت. جرب استخدام Chrome أو Edge.
        </p>
      </div>
    );
  }

  const getStateColor = () => {
    switch (state) {
      case "listening":
        return "from-neon-cyan to-neon-green";
      case "processing":
        return "from-neon-orange to-neon-magenta";
      case "speaking":
        return "from-neon-purple to-neon-magenta";
      default:
        return "from-neon-purple to-neon-cyan";
    }
  };

  const getStateText = () => {
    switch (state) {
      case "listening":
        return "جاري الاستماع...";
      case "processing":
        return "جاري التفكير...";
      case "speaking":
        return "جاري الرد...";
      default:
        return "اضغط على الميكروفون للتحدث";
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden" data-testid="voice-assistant">
      <div className="p-4 border-b border-neon-purple/30 bg-gradient-to-r from-neon-purple/10 to-neon-magenta/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">الخبير الأسطوري</h2>
              <p className="text-sm text-white/60">تحدث معي صوتياً</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className="text-white/60 hover:text-white"
            data-testid="button-mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${getStateColor()} flex items-center justify-center cursor-pointer`}
          animate={{
            scale: state === "listening" ? [1, 1.1, 1] : state === "speaking" ? [1, 1.05, 1] : 1,
            boxShadow: state !== "idle" 
              ? ["0 0 0 0 rgba(138, 43, 226, 0)", "0 0 0 30px rgba(138, 43, 226, 0.2)", "0 0 0 0 rgba(138, 43, 226, 0)"]
              : "0 0 30px rgba(138, 43, 226, 0.3)",
          }}
          transition={{
            duration: state === "listening" ? 1.5 : 2,
            repeat: state !== "idle" ? Infinity : 0,
            ease: "easeInOut",
          }}
          onClick={state === "idle" ? startListening : state === "listening" ? stopListening : undefined}
          whileHover={{ scale: state === "idle" ? 1.05 : 1 }}
          whileTap={{ scale: state === "idle" ? 0.95 : 1 }}
          data-testid="button-mic-main"
        >
          <AnimatePresence mode="wait">
            {state === "processing" ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Loader2 className="w-16 h-16 text-white animate-spin" />
              </motion.div>
            ) : state === "listening" ? (
              <motion.div
                key="mic-on"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Mic className="w-16 h-16 text-white" />
              </motion.div>
            ) : state === "speaking" ? (
              <motion.div
                key="speaking"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Volume2 className="w-16 h-16 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="mic-off"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <MicOff className="w-16 h-16 text-white/80" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          className="mt-6 text-lg text-white/80 text-center"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {getStateText()}
        </motion.p>

        {transcript && state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 max-w-md"
            style={{ direction: "rtl" }}
          >
            <p className="text-sm text-neon-cyan">{transcript}</p>
          </motion.div>
        )}

        {lastResponse && state === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 max-w-md"
            style={{ direction: "rtl" }}
          >
            <p className="text-sm text-white/80 leading-relaxed">{lastResponse}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
