import { useEffect, useRef } from 'react'
import './Timer.css'

export default function Timer({ seconds, isRunning, onTick }) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => onTick(), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, onTick]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="timer">
      <span className="timer-icon">⏱</span>
      <span className="timer-display">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}
