import "./Chatbot.css";
import { useState } from "react";
import RealTimeClock from "./clock";

const Chatbot = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [personality, setPersonality] = useState<string>("Serious");

  const handlePersonalityChange = (value: string) => {
    setPersonality(value);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setResponse((prev) => prev + `\nUser: ${prompt}\n`);
    setIsTyping(true);
    setPrompt("");

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt, personality }), // Pass personality here
      });

      const data = await res.json();
      animateOutput(`Bot: ${data.response}`);
    } catch (error) {
      console.error("Error calling API:", error);
      setResponse(
        (prev) => prev + "Bot: Something went wrong while contacting the bot.\n"
      );
      setIsTyping(false);
    }
  };

  const animateOutput = (text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      setResponse((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);
  };

  const handleClear = () => {
    setPrompt("");
    setResponse("");
  };

  return (
    <>
      <RealTimeClock onPersonalityChange={handlePersonalityChange} />
      <div className="chatbot">
        <div className="output_area">
          <textarea
            name="output"
            className="output-area"
            value={response}
            readOnly
          ></textarea>
        </div>
        <div className="prompt-container">
          <input
            className="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            placeholder="Type your prompt..."
            disabled={isTyping}
          />
          <button className="voice-input">
            <i className="fa">&#xf130;</i>
          </button>
        </div>
        <div className="btn-grp">
          <button
            className="sub-btn"
            onClick={handleSubmit}
            disabled={isTyping}
          >
            Submit
          </button>
          <button className="sub-btn" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
