import { useRef, useState, useEffect } from "react";
import { getEnglishFemaleVoice } from "@/utils/stripCodeFromMarkdown";

export function useSpeechSynthesis(text) {
  const utteranceRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | playing | paused

  const speak = () => {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getEnglishFemaleVoice();

    utterance.onstart = () => setStatus("playing");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setStatus("idle");
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    status,
    speak,
    pause,
    resume,
    stop,
  };
}

