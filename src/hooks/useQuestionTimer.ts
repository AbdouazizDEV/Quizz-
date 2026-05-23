import { useCallback, useEffect, useRef, useState } from 'react';

interface UseQuestionTimerParams {
  duration: number;
  onExpire: () => void;
  autoStart?: boolean;
  /** Incrémenter pour relancer le chrono (ex. index de question). */
  resetKey?: number | string;
}

interface UseQuestionTimerReturn {
  timeLeft: number;
  progress: number;
  isRunning: boolean;
  isExpired: boolean;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useQuestionTimer({
  duration,
  onExpire,
  autoStart = true,
  resetKey = 0,
}: UseQuestionTimerParams): UseQuestionTimerReturn {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setTimeLeft(duration);
    setIsExpired(false);
    setIsRunning(autoStart);
  }, [autoStart, clearTimer, duration]);

  useEffect(() => {
    reset();
  }, [duration, resetKey, reset]);

  useEffect(() => {
    if (!isRunning || isExpired) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setIsExpired(true);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [clearTimer, isExpired, isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (!isExpired) setIsRunning(true);
  }, [isExpired]);

  const safeDuration = duration > 0 ? duration : 1;

  return {
    timeLeft,
    progress: timeLeft / safeDuration,
    isRunning,
    isExpired,
    pause,
    resume,
    reset,
  };
}
