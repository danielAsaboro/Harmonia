// /components/calendar/utils/dateUtils.ts
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { CalendarEvent } from "../types";

export const dateUtils = {
  getWeekDays: (currentDate: Date) => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  },

  getMonthDays: (currentDate: Date) => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  },

  getEventsForDay: (events: CalendarEvent[], date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return format(eventDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    });
  },

  getEventsForTimeSlot: (events: CalendarEvent[], date: Date, hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        format(eventDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
        eventDate.getHours() === hour
      );
    });
  },

  createTimeSlots: (date: Date, workingHours = { start: 9, end: 17 }) => {
    const slots = [];
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      slots.push(slotDate);
    }
    return slots;
  },
};
