import { cn } from "@/utils/ts-merge";

export const getDragStyles = (
  isOver: boolean,
  isToday: boolean,
  isDragging: boolean
): string => {
  return cn(
    "transition-colors duration-200",
    isOver && "bg-blue-50/50",
    isToday && "bg-blue-50",
    isDragging && "opacity-50"
  );
};
