import React, { useState, useEffect, useRef } from "react";
import "./Container.css";

type Message = {
  sender: "user" | "bot";
  text: string;
};

const Container: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [personality, setPersonality] = useState<
    "None" | "Serious" | "Humorous" | "Sarcastic"
  >("None");

  const handleClear = async () => {
    setPrompt("");
    setMessages([]);
    setIsTyping(false);

    try {
      await fetch("http://localhost:8000/clear", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error clearing history on server:", error);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const userMessage: Message = { sender: "user", text: prompt + "\n" };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          personality: personality, // Send the personality value along with the message
        }),
      });

      const data = await response.json();
      animateOutput(data.response);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong." },
      ]);
      setIsTyping(false);
    }
  };

  const animateOutput = (text: string) => {
    let index = 0;
    let current = "";
    const fullText = text + "\n";

    setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

    const interval = setInterval(() => {
      current += fullText.charAt(index);
      index++;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "bot", text: current };
        return updated;
      });

      if (index >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [messages]);

  const extractCodeBlock = (text: string) => {
    const match = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return match ? match[1] : null;
  };

  return (
    <>
      <div className="personality-slider">
        <label htmlFor="personality">Personality:</label>
        <select
          id="personality"
          value={personality}
          onChange={(e) =>
            setPersonality(
              e.target.value as "None" | "Serious" | "Humorous" | "Sarcastic"
            )
          }
          className="personality-dropdown"
        >
          <option value="None">None</option>
          <option value="Serious">Serious</option>
          <option value="Humorous">Humorous</option>
          <option value="Sarcastic">Sarcastic</option>
        </select>
      </div>

      <div className="container">
        <div className="output-box" ref={outputRef}>
          {messages.map((msg, idx) => {
            if (msg.sender === "bot" && msg.text.includes("```")) {
              const code = extractCodeBlock(msg.text);
              const plainText = msg.text
                .replace(/```(?:\w+)?\n[\s\S]*?```/, "")
                .trim();

              return (
                <div key={idx} className="message bot code-block">
                  <strong>Bot:</strong>
                  {plainText && <p>{plainText}</p>}
                  <pre className="code-box">
                    <code className="code">{code}</code>
                  </pre>
                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(code || "");
                      setCopiedIndex(idx); // Set the copied index to indicate that this specific message is copied
                      setShowToast(true); // Show the toast
                      setTimeout(() => {
                        setShowToast(false); // Hide the toast after 5 seconds
                        setCopiedIndex(null); // Reset the copied index after 5 seconds
                      }, 5000); // 5000ms = 5 seconds
                    }}
                  >
                    {copiedIndex === idx ? "Copied ✅" : "Copy"}
                  </button>

                  <select
                    className="download-dropdown"
                    onChange={(e) => {
                      const extension = e.target.value;
                      const blob = new Blob([code || ""], {
                        type: "text/plain",
                      });
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(blob);
                      link.download = `code_snippet.${extension}`;
                      link.click();
                      URL.revokeObjectURL(link.href);
                      e.target.selectedIndex = 0; // Reset to placeholder
                    }}
                  >
                    <option disabled selected>
                      Download
                    </option>
                    <option value="py">.py</option>
                    <option value="txt">.txt</option>
                  </select>
                  {showToast && (
                    <div className="toast">✅ Code copied to clipboard</div>
                  )}
                </div>
              );
            }

            return (
              <div key={idx} className={`message ${msg.sender}`}>
                <strong>{msg.sender === "user" ? "You: " : "T.A.R.S: "}</strong>
                <span>{msg.text}</span>
              </div>
            );
          })}
        </div>

        <textarea
          className="prompt-box"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isTyping}
        />

        <div className="button-group">
          <button className="btn" onClick={handleClear}>
            Clear
          </button>
          <button className="btn" onClick={handleSubmit} disabled={isTyping}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default Container;
