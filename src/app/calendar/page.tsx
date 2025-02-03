// /app/calendar/page.tsx
"use client";
import { useState } from "react";
import CalendarView from "@/components/calendar/CalendarView";
import { CalendarEvent } from "@/components/calendar/types";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Community Meeting",
      start: new Date(2024, 1, 5, 10, 0), // Feb 5, 2024, 10:00
      end: new Date(2024, 1, 5, 11, 0),
      type: "community",
      tags: ["planning", "team"],
      isDeletable: true, // Mark some events as deletable
    },
    {
      id: "2",
      title: "Educational Workshop",
      start: new Date(2024, 1, 6, 14, 0), // Feb 6, 2024, 14:00
      end: new Date(2024, 1, 6, 16, 0),
      type: "educational",
      tags: ["solana", "development"],
      isDeletable: true, // Mark some events as deletable
    },
    {
      id: "3",
      title: "Meme Contest",
      start: new Date(2024, 1, 7, 12, 0), // Feb 7, 2024, 12:00
      end: new Date(2024, 1, 7, 13, 0),
      type: "meme",
      tags: ["fun", "engagement"],
      isDeletable: true, // Mark some events as deletable
    },
  ]);

  const handleEventCreate = (eventData: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: Math.random().toString(),
      title: eventData.title || "Untitled",
      start: eventData.start || new Date(),
      end: eventData.end || new Date(),
      type: eventData.type || "community",
      tags: eventData.tags || [],
      isDeletable: true, // New events are deletable
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

    const handleEventDrop = (event: CalendarEvent, start: Date, end: Date) => {
    const updatedEvent = {
      ...event,
      start,
      end,
    };
    handleEventUpdate(updatedEvent);
  };

  const handleEventDelete = (eventToDelete: CalendarEvent) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventToDelete.id));
  };

  return (
    <div className="h-screen bg-white">
      <CalendarView
        events={events}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDrop={handleEventDrop}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
}
