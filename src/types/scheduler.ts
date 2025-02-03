// /types/scheduler.ts

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

export interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  endDate?: Date;
}

export interface QueueSlot {
  id: string;
  position: number;
  estimatedTime: Date;
  priority: "normal" | "high" | "urgent";
}

export interface ScheduleState {
  selectedDate: Date;
  selectedSlot: TimeSlot | null;
  queuedSlots: QueueSlot[];
  timezone: string;
  view: "grid" | "list";
}

export interface SchedulePickerProps {
  onSchedule: (date: Date) => void;
  onCancel: () => void;
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  timeSlotDuration?: number; // in minutes
  workingHours?: {
    start: number; // 0-23
    end: number; // 0-23
  };
}
