import { useEffect, useRef, useState } from 'react';

export default function useCardOptionsMenu<T extends HTMLElement>() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isOptionsOpen) {
      return;
    }

    const closeOptionsOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOptionsOnOutsideClick);
    return () =>
      document.removeEventListener('pointerdown', closeOptionsOnOutsideClick);
  }, [isOptionsOpen]);

  const toggleOptions = () => {
    setIsOptionsOpen((isOpen) => !isOpen);
  };

  return {
    containerRef,
    isOptionsOpen,
    setIsOptionsOpen,
    toggleOptions,
  };
}
