// /components/calendar/MonthView.tsx
import React, { useCallback, useState, memo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { CalendarEvent, DragPosition } from "./types";
import { Card } from "../ui/card";
import { cn } from "@/utils/ts-merge";
import { useMousePosition } from "./hooks/useMousePosition";

type Week = Date[];

interface MonthViewProps {
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

// Memoized drag preview component
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
  const [dragTargetDate, setDragTargetDate] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mousePosition = useMousePosition();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific day
  const getEventsForDay = useCallback(
    (date: Date) => {
      return events.filter((event) => isSameDay(new Date(event.start), date));
    },
    [events]
  );

  // Calculate grid position for day
  const getDayPosition = (date: Date) => {
    const firstDayOfMonth = startOfMonth(date);
    const dayOfWeek = firstDayOfMonth.getDay();
    const dayOfMonth = date.getDate();
    const weekNumber = Math.floor((dayOfMonth + dayOfWeek - 1) / 7);
    return { weekNumber, dayOfWeek };
  };

  // Generate grid of weeks
  const weeks: Week[] = [];
  let currentWeek: Week = [];
  let currentWeekNumber = 0;

  days.forEach((day) => {
    const { weekNumber } = getDayPosition(day);
    if (weekNumber !== currentWeekNumber) {
      weeks.push(currentWeek);
      currentWeek = [];
      currentWeekNumber = weekNumber;
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    setDraggingEvent(event);
    setIsDragging(true);

    // Create custom drag preview
    const dragImage = new Image();
    dragImage.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragOver = (date: Date, e: React.DragEvent) => {
    e.preventDefault();
    setDragTargetDate(date);
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
      setDragTargetDate(null);
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setDraggingEvent(null);
    setDragTargetDate(null);
    setIsDragging(false);
  };

  return (
    <div className="flex-1 grid grid-cols-7 grid-rows-6 border-t border-l">
      {/* Day headers */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="p-2 text-sm font-medium border-b border-r">
          {day}
        </div>
      ))}

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <React.Fragment key={weekIndex}>
          {week.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDropTarget =
              dragTargetDate && isSameDay(day, dragTargetDate);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[120px] p-2 border-b border-r relative transition-colors duration-150",
                  !isCurrentMonth && "bg-gray-50",
                  isToday(day) && "bg-blue-50/20",
                  isDropTarget && "bg-blue-50"
                )}
                onClick={() => onSlotClick(day)}
                onDragOver={(e) => handleDragOver(day, e)}
                onDrop={() => handleDrop(day)}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !isCurrentMonth && "text-gray-400"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {dayEvents.map((event) => (
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
                        "p-1 cursor-move text-xs transition-transform duration-150 hover:scale-[1.02]",
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
                      <div className="font-medium truncate">
                        {format(new Date(event.start), "HH:mm")} - {event.title}
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
              </div>
            );
          })}
        </React.Fragment>
      ))}

      {/* Drag Preview */}
      {isDragging && draggingEvent && (
        <DragPreview event={draggingEvent} position={mousePosition} />
      )}
    </div>
  );
}
