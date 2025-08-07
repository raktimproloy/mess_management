import { useEffect, useRef } from 'react';

export const usePreventScroll = () => {
  const inputRef = useRef(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const preventScroll = (e) => {
      e.preventDefault();
    };

    // Prevent scroll wheel from changing the value
    input.addEventListener('wheel', preventScroll, { passive: false });
    
    // Prevent up/down arrow keys from changing the value
    const preventArrowKeys = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    };
    
    input.addEventListener('keydown', preventArrowKeys);

    return () => {
      input.removeEventListener('wheel', preventScroll);
      input.removeEventListener('keydown', preventArrowKeys);
    };
  }, []);

  return inputRef;
};
