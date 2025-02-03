// /components/calendar/hooks/useMousePosition.ts
import { useState, useEffect } from "react";
import { DragPosition } from "../types";

export const useMousePosition = (): DragPosition => {
  const [position, setPosition] = useState<DragPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updatePosition);
    return () => window.removeEventListener("mousemove", updatePosition);
  }, []);

  return position;
};
