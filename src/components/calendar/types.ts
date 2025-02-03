// /components/calendar/types.ts

export type CalendarViewType = "week" | "month";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "community" | "educational" | "meme" | "challenge";
  tags?: string[];
  isEmptySlot?: boolean;
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (event: CalendarEvent, start: Date, end: Date) => void;
  onSlotClick: (start: Date) => void;
  onEventCreate: (event: Partial<CalendarEvent>) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  viewType: CalendarViewType;
  timezone: string;
}

export interface DragState {
  isDragging: boolean;
  draggedEvent: CalendarEvent | null;
  dragSource: {
    date: Date;
    position: { x: number; y: number };
  } | null;
  dropTarget: {
    date: Date;
    position: { x: number; y: number };
  } | null;
}

export interface DraggedEventMetadata {
  sourceDate: Date;
  eventId: string;
  eventType: string;
}

export type CalendarEventType =
  | "community"
  | "educational"
  | "meme"
  | "challenge";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: CalendarEventType;
  tags?: string[];
  isEmptySlot?: boolean;
}

export interface DragPosition {
  x: number;
  y: number;
}

export interface DragTarget {
  day: number;
  hour: number;
}
