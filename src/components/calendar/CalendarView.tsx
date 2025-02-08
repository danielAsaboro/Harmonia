// /components/calendar/CalendarView.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  ArrowLeft,
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
import ConfirmDialog from "../editor/ConfirmDialog";
import KeyboardShortcutsDialog from "@/components/keyboard/KeyboardShortcutsDialog";
import { useKeyboard } from "@/context/keyboard-context";

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
  onEventDelete,
  initialViewType = "week",
  timezone = "UTC",
}: Props) {
  const [viewType, setViewType] = useState<CalendarViewType>(initialViewType);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showShortcuts, setShowShortcuts } = useKeyboard();

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

  const handleDeleteEvent = () => {
    if (onEventDelete && selectedEvent) {
      onEventDelete(selectedEvent);
    }
    setShowDeleteConfirm(false);
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

  useEffect(() => {
    const handleViewChange = (e: CustomEvent) => {
      const view = e.detail as "month" | "week";
      setViewType(view);
    };

    const handleNavigation = (e: CustomEvent) => {
      const direction = e.detail as "prev" | "next";
      if (direction === "prev") {
        handlePrevious();
      } else {
        handleNext();
      }
    };

    const handleToday = () => {
      setCurrentDate(new Date());
    };

    window.addEventListener("calendarView", handleViewChange as EventListener);
    window.addEventListener("calendarNav", handleNavigation as EventListener);
    window.addEventListener("calendarToday", handleToday);

    return () => {
      window.removeEventListener(
        "calendarView",
        handleViewChange as EventListener
      );
      window.removeEventListener(
        "calendarNav",
        handleNavigation as EventListener
      );
      window.removeEventListener("calendarToday", handleToday);
    };
  });

  // Add to CalendarView useEffect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "t":
            handleToday();
            break;
          case "m":
            handleViewChange("month");
            break;
          case "w":
            handleViewChange("week");
            break;
          case "arrowleft":
            handlePrevious();
            break;
          case "arrowright":
            handleNext();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleViewChange, handleToday, handlePrevious, handleNext]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {/* Back to Editor Link */}
        <Link
          href="/content/compose/twitter"
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
          <span className="text-sm font-medium">Back to Editor</span>
        </Link>

        {/* Date and Timezone Info */}
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-semibold text-white">
            {viewType === "week"
              ? `${format(startOfWeek(currentDate), "MMM d")} - ${format(
                  endOfWeek(currentDate),
                  "MMM d, yyyy"
                )}`
              : format(currentDate, "MMMM yyyy")}
          </h1>
          <div className="flex items-start gap-1 text-xs text-gray-400 mt-1">
            <Globe className="w-3.5 h-3.5 mr-1" />
            <span>{timezone}</span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleToday}
            className="
              rounded-full 
              bg-slate-800 
              text-gray-300 
              hover:bg-slate-700 
              hover:text-white 
              transition-all 
              px-4 
              py-2 
              text-sm 
              font-medium
              border 
              border-slate-700
              shadow-sm
              hover:shadow-md
            "
          >
            Today
          </Button>

          <div className="flex items-center rounded-lg border border-gray-700">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-r-none hover:bg-gray-800"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-l-none hover:bg-gray-800"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex rounded-lg border border-gray-700 overflow-hidden">
          {(["week", "month"] as const).map((view) => (
            <button
              key={view}
              onClick={() => handleViewChange(view)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors 
                ${
                  viewType === view
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }
              `}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        <button
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Calendar Settings"
        >
          <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
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
          onDelete={onEventDelete ? handleDeleteEvent : undefined}
          event={selectedEvent}
          defaultDate={selectedDate}
        />

        {/* Deletion Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteEvent}
          title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      </div>

      {/* Keyboard Shortcut */}
      <KeyboardShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
