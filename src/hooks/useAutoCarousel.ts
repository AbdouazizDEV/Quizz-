import { Dispatch, SetStateAction, useEffect } from 'react';

interface UseAutoCarouselParams {
  itemCount: number;
  intervalMs: number;
  setIndex: Dispatch<SetStateAction<number>>;
}

export function useAutoCarousel({
  itemCount,
  intervalMs,
  setIndex,
}: UseAutoCarouselParams) {
  useEffect(() => {
    if (itemCount <= 1) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setIndex((prev) => (prev + 1) % itemCount);
    }, intervalMs);

    return () => {
      clearInterval(timerId);
    };
  }, [intervalMs, itemCount, setIndex]);
}
