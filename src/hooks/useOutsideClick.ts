import React, { useEffect } from "react";

/**
 * Custom hook to detect clicks outside of a specified element.
 *
 * @param {React.RefObject<HTMLDivElement>} ref - The ref of the element to monitor.
 * @param {(event: MouseEvent | TouchEvent) => void} callback - The function to call when an outside click is detected.
 */
export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: (event: MouseEvent | TouchEvent) => void
): void => {
  useEffect(() => {

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};
