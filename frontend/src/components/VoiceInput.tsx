import { useEffect, useRef } from "react";

interface VoiceInputProps {
  onResult: (text: string) => void;
}

const VoiceInput = ({ onResult }: VoiceInputProps) => {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US"; // or "kn-IN" for Kannada
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const voiceText = event.results[0][0].transcript;
        onResult(voiceText);
      };

      recognitionRef.current = recognition;
    } else {
      alert("Speech Recognition not supported in this browser");
    }
  }, [onResult]);

  const startListening = () => {
    recognitionRef.current?.start();
  };

  return (
    <button className="voice-input-btn" onClick={startListening}>
      <i className="fa">&#xf130;</i>
    </button>
  );
};

export default VoiceInput;
