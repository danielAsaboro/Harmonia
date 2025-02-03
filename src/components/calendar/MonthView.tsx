// /components/calendar/MonthView.tsx
import React, { memo, useCallback, useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { CalendarEvent, CalendarEventType, DragPosition } from "./types";
import { Card } from "../ui/card";
import { cn } from "@/utils/ts-merge";
import { useMousePosition } from "./hooks/useMousePosition";

const MAX_VISIBLE_EVENTS = 3;

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (event: CalendarEvent, start: Date, end: Date) => void;
  onSlotClick: (start: Date) => void;
  timezone: string;
}

const EVENT_TYPE_STYLES: Record<CalendarEventType | "default", string> = {
  default: "bg-blue-900/50 border-blue-700 hover:bg-blue-800/50",
  community: "bg-green-900/50 border-green-700 hover:bg-green-800/50",
  educational: "bg-purple-900/50 border-purple-700 hover:bg-purple-800/50",
  meme: "bg-pink-900/50 border-pink-700 hover:bg-pink-800/50",
  challenge: "bg-orange-900/50 border-orange-700 hover:bg-orange-800/50",
  tweet: "bg-blue-900/50 border-blue-700 hover:bg-blue-800/50",
  thread: "bg-indigo-900/50 border-indigo-700 hover:bg-indigo-800/50",
};

interface StackedEventsProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDragStart: (event: CalendarEvent, e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const StackedEvents: React.FC<StackedEventsProps> = ({
  events,
  onEventClick,
  onDragStart,
  onDragEnd,
}) => {
  const [showAll, setShowAll] = useState(false);
  const visibleEvents = showAll ? events : events.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenCount = events.length - MAX_VISIBLE_EVENTS;

  return (
    <div className="absolute inset-x-1 inset-y-0.5">
      {visibleEvents.map((event, index) => (
        <Card
          key={event.id}
          draggable
          onDragStart={(e) => onDragStart(event, e)}
          onDragEnd={onDragEnd}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick(event);
          }}
          className={cn(
            "absolute inset-x-0 cursor-move p-1.5 transition-all duration-150",
            "hover:z-50 hover:scale-105 border border-opacity-50",
            "text-gray-100",
            event.isEmptySlot
              ? "border-dashed border-gray-700 bg-gray-800/50"
              : EVENT_TYPE_STYLES[event.type] || EVENT_TYPE_STYLES.default
          )}
          style={{
            height: "calc(100% - 4px)",
            transform: `translateY(${index * 4}px)`,
            zIndex: index,
          }}
        >
          <div className="text-xs font-medium truncate">{event.title}</div>
          {event.tags && event.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1 text-[10px] rounded bg-black/20 text-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Card>
      ))}
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAll(true);
          }}
          className="absolute bottom-0 right-0 text-xs bg-gray-800 px-2 py-0.5 rounded
                     text-blue-400 hover:text-blue-300 font-medium transition-colors
                     border border-gray-700 hover:bg-gray-700"
        >
          +{hiddenCount} more
        </button>
      )}
    </div>
  );
};

const DragPreview = memo(
  ({ event, position }: { event: CalendarEvent; position: DragPosition }) => (
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
          "p-2 border border-opacity-50 text-gray-100",
          EVENT_TYPE_STYLES[event.type] || EVENT_TYPE_STYLES.default
        )}
      >
        <div className="text-sm font-medium truncate">{event.title}</div>
      </Card>
    </div>
  )
);

DragPreview.displayName = "DragPreview";

export default function MonthView({
  events,
  currentDate,
  onEventClick,
  onEventDrop,
  onSlotClick,
}: MonthViewProps) {
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const mousePosition = useMousePosition();

  // Calculate month start and end, including days from previous/next months
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDraggingEvent(null);
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging]);

  const getEventsForDay = useCallback(
    (date: Date) => {
      return events.filter((event) => isSameDay(new Date(event.start), date));
    },
    [events]
  );

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    setDraggingEvent(event);
    setIsDragging(true);

    const dragImage = new Image();
    dragImage.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDrop = (targetDate: Date) => {
    if (draggingEvent) {
      const originalDate = new Date(draggingEvent.start);
      const newStart = new Date(targetDate);
      newStart.setHours(originalDate.getHours());
      newStart.setMinutes(originalDate.getMinutes());

      const duration =
        draggingEvent.end.getTime() - draggingEvent.start.getTime();
      const newEnd = new Date(newStart.getTime() + duration);

      onEventDrop(draggingEvent, newStart, newEnd);
      setDraggingEvent(null);
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setDraggingEvent(null);
    setIsDragging(false);
  };

  return (
    <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-gray-900 border-t border-l border-gray-800/50">
      {/* Day headers */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          className="p-2 text-sm font-medium border-b border-r border-gray-800/50 text-gray-300"
        >
          {day}
        </div>
      ))}

      {/* Calendar grid */}
      {days.map((day, index) => {
        const dayEvents = getEventsForDay(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isCurrentDay = isToday(day);

        return (
          <div
            key={index}
            onClick={() => onSlotClick(day)}
            className={cn(
              "min-h-[120px] p-2 border-b border-r border-gray-800/50 relative transition-colors duration-150",
              !isCurrentMonth && "bg-gray-900/50",
              isCurrentDay && "bg-blue-900/20",
              "hover:bg-gray-800/20"
            )}
          >
            <div className="flex justify-between items-start">
              <span
                className={cn(
                  "text-sm font-medium",
                  !isCurrentMonth ? "text-gray-500" : "text-gray-300",
                  isCurrentDay && "text-blue-400"
                )}
              >
                {format(day, "d")}
              </span>
            </div>

            <div className="mt-2 space-y-1 relative">
              {dayEvents.length > 0 && (
                <StackedEvents
                  events={dayEvents}
                  onEventClick={onEventClick}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Drag preview */}
      {isDragging && draggingEvent && (
        <DragPreview event={draggingEvent} position={mousePosition} />
      )}
    </div>
  );
}
