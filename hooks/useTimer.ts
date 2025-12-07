// hooks/useTimer.ts
import { useEffect, useRef, useState } from "react";

export default function useTimer(seconds: number, onExpire?: () => void) {
  const [timeLeft, setTimeLeft] = useState<number>(seconds);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setTimeLeft(seconds);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return { timeLeft, reset: (s = seconds) => setTimeLeft(s) };
}
