// /components/calendar/WeekView.tsx
import React, { memo, useCallback, useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import {
  CalendarEvent,
  CalendarEventType,
  DragPosition,
  DragTarget,
} from "./types";
import { Card } from "../ui/card";
import { cn } from "@/utils/ts-merge";
import { useMousePosition } from "./hooks/useMousePosition";

const MAX_VISIBLE_EVENTS = 3;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = Array.from({ length: 7 }, (_, i) => i);

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (event: CalendarEvent, start: Date, end: Date) => void;
  onSlotClick: (start: Date) => void;
  timezone: string;
}

interface StackedEventsProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDragStart: (event: CalendarEvent, e: React.DragEvent) => void;
  onDragEnd: () => void;
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
    <div className="flex flex-1 overflow-hidden bg-gray-900">
      {/* Time column */}
      <div className="flex-none w-16 border-r border-gray-800/50">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-20 border-b border-gray-800/30 text-xs text-gray-400 text-right pr-2 py-1"
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
          const isCurrentDay = isToday(date);

          return (
            <div
              key={day}
              className={cn(
                "border-b border-r border-gray-800/50 px-2 py-1",
                isCurrentDay && "bg-blue-900/20"
              )}
            >
              <div className="text-sm font-medium text-gray-300">
                {format(date, "EEE")}
              </div>
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
                    "h-20 border-b border-r border-gray-800/30 relative transition-colors duration-150",
                    isCurrentDay && "bg-blue-900/10",
                    dragTarget?.day === day &&
                      dragTarget?.hour === hour &&
                      "bg-blue-900/20",
                    "hover:bg-gray-800/20"
                  )}
                  onClick={() => onSlotClick(date)}
                  onDragOver={(e) => handleDragOver(day, hour, e)}
                  onDrop={() => handleDrop(day, hour)}
                >
                  {slotEvents.length > 0 && (
                    <StackedEvents
                      events={slotEvents}
                      onEventClick={onEventClick}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Drag preview */}
      {isDragging && draggingEvent && (
        <DragPreview event={draggingEvent} position={mousePosition} />
      )}
    </div>
  );
}
