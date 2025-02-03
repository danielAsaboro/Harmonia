// /components/calendar/CalendarView.tsx
import { useState } from "react";
import {
  Settings,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CalendarEvent, CalendarViewProps, CalendarViewType } from "./types";
import {
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import EventModal from "./EventModal";
import { Button } from "../ui/button";

interface Props
  extends Omit<
    CalendarViewProps,
    "onEventClick" | "onSlotClick" | "timezone" | "viewType"
  > {
  initialViewType?: CalendarViewType;
  timezone?: string;
}

export default function CalendarView({
  events,
  onEventDrop,
  onEventCreate,
  onEventUpdate,
  initialViewType = "week",
  timezone = "UTC",
}: Props) {
  const [viewType, setViewType] = useState<CalendarViewType>(initialViewType);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    CalendarEvent | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleViewChange = (newView: CalendarViewType) => {
    setViewType(newView);
  };
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setShowEventModal(true);
  };

  const handleSlotClick = (date: Date) => {
    setSelectedEvent(undefined);
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (selectedEvent) {
      onEventUpdate({ ...selectedEvent, ...(eventData as CalendarEvent) });
    } else {
      onEventCreate(eventData);
    }
    setShowEventModal(false);
  };

  const handlePrevious = () => {
    setCurrentDate((current) => {
      if (viewType === "week") {
        return subWeeks(current, 1);
      }
      return subMonths(current, 1);
    });
  };

  const handleNext = () => {
    setCurrentDate((current) => {
      if (viewType === "week") {
        return addWeeks(current, 1);
      }
      return addMonths(current, 1);
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">
              {viewType === "week"
                ? `${format(startOfWeek(currentDate), "MMM d")} - ${format(
                    endOfWeek(currentDate),
                    "MMM d, yyyy"
                  )}`
                : format(currentDate, "MMMM yyyy")}
            </h1>
            <div className="text-sm text-gray-500">Timezone: {timezone}</div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>

          <div className="flex items-center rounded-lg border border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-r-none"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-l-none"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex rounded-lg border">
          <button
            onClick={() => handleViewChange("week")}
            className={`px-3 py-1.5 text-sm ${
              viewType === "week" ? "bg-primary text-white" : ""
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange("month")}
            className={`px-3 py-1.5 text-sm ${
              viewType === "month" ? "bg-primary text-white" : ""
            }`}
          >
            Month
          </button>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid - To be implemented */}
      <div className="flex-1 overflow-auto">
        {/* Week/Month view components will go here */}
        {viewType === "week" ? (
          <WeekView
            events={events}
            currentDate={currentDate}
            onEventClick={handleEventClick}
            onEventDrop={onEventDrop}
            onSlotClick={handleSlotClick}
            timezone={timezone}
          />
        ) : (
          <MonthView
            events={events}
            currentDate={currentDate}
            onEventClick={handleEventClick}
            onEventDrop={onEventDrop}
            onSlotClick={handleSlotClick}
            timezone={timezone}
          />
        )}
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(undefined);
            setSelectedDate(undefined);
          }}
          onSave={handleSaveEvent}
          event={selectedEvent}
          defaultDate={selectedDate}
        />
      </div>
    </div>
  );
}
