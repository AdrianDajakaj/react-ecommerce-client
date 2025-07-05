import { useContext } from "react";
import { MouseEnterContext } from "@/lib/MouseEnterContext";

/**
 * Custom hook to access the MouseEnterContext.
 * Throws an error if used outside of a MouseEnterProvider.
 *
 * @returns {MouseEnterContextType} The context value
 */
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};
