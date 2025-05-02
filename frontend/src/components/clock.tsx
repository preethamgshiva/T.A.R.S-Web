import "./clock.css";
import { useState, useEffect } from "react";

type RealTimeClockProps = {
  onPersonalityChange: (value: string) => void; // Pass function to parent component
};

function RealTimeClock({ onPersonalityChange }: RealTimeClockProps) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState("Serious");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSelect = (value: string) => {
    setSelected(value);
    setShowDropdown(false);
    onPersonalityChange(value); // Pass value back to parent
  };

  return (
    <div className="clock-container">
      <div className="clock">{time}</div>
      <div className="dropdown-wrapper">
        <button
          className="dropdown-button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {selected}{" "}
          <span className="arrow" style={{ marginLeft: "6px" }}>
            ▼
          </span>
        </button>
        {showDropdown && (
          <div className="dropdown-menu">
            <div onClick={() => handleSelect("Funny")}>Funny</div>
            <div onClick={() => handleSelect("Sarcastic")}>Sarcastic</div>
            <div onClick={() => handleSelect("Serious")}>Serious</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RealTimeClock;
