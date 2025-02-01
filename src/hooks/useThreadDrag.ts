// hooks/useThreadDrag.ts
import { useState, useRef, useCallback } from "react";
import { Tweet } from "@/types/tweet";

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  dragIndex: number | null;
  startPosition: Position | null;
  currentPosition: Position | null;
}

export const useThreadDrag = (
  tweets: Tweet[],
  onReorder: (fromIndex: number, toIndex: number) => void
) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragIndex: null,
    startPosition: null,
    currentPosition: null,
  });

  const tweetsRef = useRef<(HTMLElement | null)[]>([]);

  const handleDragStart = useCallback(
    (index: number, event: React.MouseEvent) => {
      const element = tweetsRef.current[index];
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const position = { x: event.clientX, y: event.clientY };

      setDragState({
        isDragging: true,
        dragIndex: index,
        startPosition: position,
        currentPosition: position,
      });

      // Add dragging class to body to prevent text selection
      document.body.classList.add("dragging");
    },
    []
  );

  const handleDragMove = useCallback(
    (event: MouseEvent) => {
      if (!dragState.isDragging || dragState.dragIndex === null) return;

      setDragState((prev) => ({
        ...prev,
        currentPosition: { x: event.clientX, y: event.clientY },
      }));

      // Calculate potential new position
      const dragElement = tweetsRef.current[dragState.dragIndex];
      if (!dragElement) return;

      const dragRect = dragElement.getBoundingClientRect();
      const dragMiddle = dragRect.top + dragRect.height / 2;

      // Find potential drop target
      tweetsRef.current.forEach((element, index) => {
        if (!element || index === dragState.dragIndex) return;

        const rect = element.getBoundingClientRect();
        const middle = rect.top + rect.height / 2;

        if (dragMiddle < middle && index > dragState.dragIndex) {
          element.style.transform = `translateY(-${dragRect.height}px)`;
        } else if (dragMiddle > middle && index < dragState.dragIndex) {
          element.style.transform = `translateY(${dragRect.height}px)`;
        } else {
          element.style.transform = "";
        }
      });
    },
    [dragState]
  );

  const handleDragEnd = useCallback(
    (event: MouseEvent) => {
      if (!dragState.isDragging || dragState.dragIndex === null) return;

      // Reset all transforms
      tweetsRef.current.forEach((element) => {
        if (element) element.style.transform = "";
      });

      // Calculate final position
      let newIndex = dragState.dragIndex;
      const dragElement = tweetsRef.current[dragState.dragIndex];
      if (dragElement) {
        const dragRect = dragElement.getBoundingClientRect();
        const dragMiddle = dragRect.top + dragRect.height / 2;

        tweetsRef.current.forEach((element, index) => {
          if (!element || index === dragState.dragIndex) return;

          const rect = element.getBoundingClientRect();
          const middle = rect.top + rect.height / 2;

          if (dragMiddle < middle && newIndex < index) {
            newIndex = index;
          } else if (dragMiddle > middle && newIndex > index) {
            newIndex = index;
          }
        });
      }

      // Reorder if position changed
      if (newIndex !== dragState.dragIndex) {
        onReorder(dragState.dragIndex, newIndex);
      }

      // Reset drag state
      setDragState({
        isDragging: false,
        dragIndex: null,
        startPosition: null,
        currentPosition: null,
      });

      // Remove dragging class from body
      document.body.classList.remove("dragging");
    },
    [dragState, onReorder]
  );

  // Set up and clean up event listeners
  const setupDragListeners = useCallback(() => {
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  return {
    dragState,
    tweetsRef,
    handleDragStart,
    setupDragListeners,
  };
};
