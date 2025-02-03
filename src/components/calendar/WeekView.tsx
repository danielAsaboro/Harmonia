// /components/calendar/WeekView.tsx
import React, { memo, useCallback, useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { CalendarEvent, DragPosition, DragTarget } from "./types";
import { Card } from "../ui/card";
import { cn } from "@/utils/ts-merge";
import { useMousePosition } from "./hooks/useMousePosition";

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (event: CalendarEvent, start: Date, end: Date) => void;
  onSlotClick: (start: Date) => void;
  timezone: string;
}

interface DragPreviewProps {
  event: CalendarEvent;
  position: DragPosition;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = Array.from({ length: 7 }, (_, i) => i);

// Create a memoized drag preview component
const DragPreview = memo(({ event, position }: DragPreviewProps) => (
  <div
    className="fixed pointer-events-none z-50 opacity-70"
    style={{
      left: position.x + 10,
      top: position.y + 10,
      width: "200px",
    }}
  >
    <Card
      className={cn(
        "p-2",
        event.type === "community" && "bg-green-50 border-green-200",
        event.type === "educational" && "bg-purple-50 border-purple-200",
        event.type === "meme" && "bg-pink-50 border-pink-200",
        event.type === "challenge" && "bg-orange-50 border-orange-200"
      )}
    >
      <div className="text-sm font-medium truncate">{event.title}</div>
    </Card>
  </div>
));

DragPreview.displayName = "DragPreview";

export default function WeekView({
  events,
  currentDate,
  onEventClick,
  onEventDrop,
  onSlotClick,
  timezone,
}: WeekViewProps) {
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(
    null
  );
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mousePosition = useMousePosition();

  const weekStart = startOfWeek(currentDate);

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

  // Get events for a specific day/hour slot
  const getEventsForSlot = useCallback(
    (day: number, hour: number) => {
      const slotDate = addDays(weekStart, day);
      slotDate.setHours(hour);

      return events.filter((event) => {
        const eventStart = new Date(event.start);
        return (
          isSameDay(slotDate, eventStart) && eventStart.getHours() === hour
        );
      });
    },
    [events, weekStart]
  );

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    setDraggingEvent(event);
    setIsDragging(true);

    // Create custom drag preview
    const dragImage = new Image();
    dragImage.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragOver = (day: number, hour: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragTarget({ day, hour });
  };

  const handleDrop = (day: number, hour: number) => {
    if (draggingEvent) {
      const newStart = addDays(weekStart, day);
      newStart.setHours(hour);
      const duration =
        draggingEvent.end.getTime() - draggingEvent.start.getTime();
      const newEnd = new Date(newStart.getTime() + duration);

      onEventDrop(draggingEvent, newStart, newEnd);
      setDraggingEvent(null);
      setDragTarget(null);
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setDraggingEvent(null);
    setDragTarget(null);
    setIsDragging(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Time labels */}
      <div className="flex-none w-16 border-r border-gray-200">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-20 border-b border-gray-100 text-xs text-gray-500 text-right pr-2"
          >
            {format(new Date().setHours(hour), "h a")}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="flex-1 grid grid-cols-7">
        {/* Day headers */}
        {DAYS.map((day) => {
          const date = addDays(weekStart, day);
          return (
            <div
              key={day}
              className="border-b border-r border-gray-200 px-2 py-1"
            >
              <div className="text-sm font-medium">{format(date, "EEE")}</div>
              <div className="text-xs text-gray-500">{format(date, "d")}</div>
            </div>
          );
        })}

        {/* Time slots */}
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            {DAYS.map((day) => {
              const slotEvents = getEventsForSlot(day, hour);
              const date = addDays(weekStart, day);
              date.setHours(hour);
              const isCurrentDay = isToday(date);

              return (
                <div
                  key={`${day}-${hour}`}
                  className={cn(
                    "h-20 border-b border-r border-gray-100 relative",
                    isCurrentDay && "bg-blue-50/20",
                    dragTarget?.day === day &&
                      dragTarget?.hour === hour &&
                      "bg-blue-50"
                  )}
                  onClick={() => onSlotClick(date)}
                  onDragOver={(e) => handleDragOver(day, hour, e)}
                  onDrop={() => handleDrop(day, hour)}
                >
                  {slotEvents.map((event) => (
                    <Card
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(event, e)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={cn(
                        "absolute inset-x-1 h-[calc(100%-4px)] cursor-move p-1",
                        event.isEmptySlot
                          ? "border-dashed bg-gray-50"
                          : "bg-blue-50 border-blue-200",
                        event.type === "community" &&
                          "bg-green-50 border-green-200",
                        event.type === "educational" &&
                          "bg-purple-50 border-purple-200",
                        event.type === "meme" && "bg-pink-50 border-pink-200",
                        event.type === "challenge" &&
                          "bg-orange-50 border-orange-200"
                      )}
                    >
                      <div className="text-xs font-medium truncate">
                        {event.title}
                      </div>
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {event.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1 text-[10px] rounded bg-white/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Drag Preview */}
      {isDragging && draggingEvent && (
        <DragPreview event={draggingEvent} position={mousePosition} />
      )}
    </div>
  );
}
