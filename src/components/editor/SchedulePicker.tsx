import React, { useState } from "react";
import { dateUtils } from "@/utils/dateUtils";

interface Props {
  onSchedule: (date: Date) => void;
  onCancel: () => void;
}

export default function SchedulePicker({ onSchedule, onCancel }: Props) {
  // Initialize with a date 24 hours from now
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [selectedDate, setSelectedDate] = useState<Date>(tomorrow);
  const [error, setError] = useState<string>("");

  const handleSchedule = () => {
    if (!dateUtils.isValidScheduleDate(selectedDate)) {
      setError("Please select a future date and time");
      return;
    }
    onSchedule(selectedDate);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="bg-gray-900 rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-white">Schedule Post</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Date and Time
            </label>
            <input
              type="datetime-local"
              value={selectedDate.toISOString().slice(0, 16)}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                setSelectedDate(newDate);
                setError("");
              }}
              className="w-full bg-gray-800 rounded p-2 text-white border border-gray-700 
                       focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              min={new Date().toISOString().slice(0, 16)}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
              className="px-4 py-2 bg-blue-500 rounded-full hover:bg-blue-600 text-white transition-colors"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
