import { useContext } from "react";
import { MouseEnterContext } from "@/lib/MouseEnterContext";

export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};
