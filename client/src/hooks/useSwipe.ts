import { useRef, useCallback } from 'react';

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 40,
}: {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    didSwipe.current = false;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      // Only treat as horizontal swipe if horizontal movement dominates
      if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        didSwipe.current = true;
        dx < 0 ? onSwipeLeft() : onSwipeRight();
      }
      startX.current = null;
      startY.current = null;
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  // Returns true (and clears the flag) if the last touch was a swipe, not a tap
  const consumeSwipe = useCallback(() => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return true;
    }
    return false;
  }, []);

  return { onTouchStart, onTouchEnd, consumeSwipe };
}
