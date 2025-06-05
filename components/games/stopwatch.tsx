import { useState, useEffect, useRef } from "react";

interface StopwatchProps {
  start: boolean;
  reset: boolean;
  onResetComplete: () => void;
  onStop: (time: number) => void;
}

export default function Stopwatch({
  start,
  reset,
  onResetComplete,
  onStop,
}: StopwatchProps) {
  const [time, setTime] = useState(0); // time in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (start) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      onStop(time); // Notify parent of the current time when stopping
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [start]);

  useEffect(() => {
    if (reset) {
      setTime(0);
      onResetComplete();
    }
  }, [reset, onResetComplete]);

  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  return <p>{formatTime(time)}</p>;
}
