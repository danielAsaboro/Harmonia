// /components/calendar/hooks/useDragDrop.ts
import { useState, useCallback, useEffect } from "react";
import {
  CalendarEvent,
  DraggedEventMetadata,
  DragState,
  DragTarget,
} from "../types";
import { differenceInMinutes, addMinutes, isSameDay } from "date-fns";
import { useMousePosition } from "./useMousePosition";

interface UseDragDropProps {
  onEventDrop: (event: CalendarEvent, start: Date, end: Date) => void;
}
export const useDragDrop = ({ onEventDrop }: UseDragDropProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedEvent: null,
    dragSource: null,
    dropTarget: null,
  });
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(
    null
  );
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mousePosition = useMousePosition();

  // Cleanup drag state when mouse is released
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDraggingEvent(null);
        setDragTarget(null);
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging]);

  const handleDragStart = useCallback(
    (
      event: CalendarEvent,
      sourceDate: Date,
      e: React.DragEvent<HTMLDivElement>
    ) => {
      // Create ghost drag image
      const dragImage = e.currentTarget.cloneNode(true) as HTMLDivElement;
      dragImage.style.opacity = "0.5";
      dragImage.style.position = "absolute";
      dragImage.style.left = "-9999px";
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);

      // Store event metadata
      const metadata: DraggedEventMetadata = {
        sourceDate,
        eventId: event.id,
        eventType: event.type,
      };
      e.dataTransfer.setData("application/json", JSON.stringify(metadata));

      setDragState({
        isDragging: true,
        draggedEvent: event,
        dragSource: {
          date: sourceDate,
          position: { x: e.clientX, y: e.clientY },
        },
        dropTarget: null,
      });

      // Cleanup ghost image after drag
      requestAnimationFrame(() => {
        document.body.removeChild(dragImage);
      });
    },
    []
  );

  const handleDragOver = useCallback(
    (date: Date, e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (!dragState.isDragging || !dragState.draggedEvent) return;

      setDragState((prev) => ({
        ...prev,
        dropTarget: {
          date,
          position: { x: e.clientX, y: e.clientY },
        },
      }));
    },
    [dragState.isDragging, dragState.draggedEvent]
  );

  const handleDrop = useCallback(
    (targetDate: Date, e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (
        !dragState.isDragging ||
        !dragState.draggedEvent ||
        !dragState.dragSource
      ) {
        return;
      }

      const metadata = JSON.parse(
        e.dataTransfer.getData("application/json")
      ) as DraggedEventMetadata;

      // Calculate new dates
      const minutesDiff = differenceInMinutes(
        targetDate,
        dragState.dragSource.date
      );

      const newStart = addMinutes(dragState.draggedEvent.start, minutesDiff);
      const newEnd = addMinutes(dragState.draggedEvent.end, minutesDiff);

      // Only update if date actually changed
      if (!isSameDay(dragState.draggedEvent.start, newStart)) {
        onEventDrop(dragState.draggedEvent, newStart, newEnd);
      }

      // Reset drag state
      setDragState({
        isDragging: false,
        draggedEvent: null,
        dragSource: null,
        dropTarget: null,
      });
    },
    [dragState, onEventDrop]
  );

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedEvent: null,
      dragSource: null,
      dropTarget: null,
    });
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggingEvent,
    dragTarget,
    isDragging,
    mousePosition,
  };
};
