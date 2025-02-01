import React from 'react';
import { dateUtils } from '@/utils/dateUtils';

interface Props {
  onSchedule: (date: Date) => void;
  onCancel: () => void;
}

export default function SchedulePicker({ onSchedule, onCancel }: Props) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  );

  const handleSchedule = () => {
    if (dateUtils.isValidScheduleDate(selectedDate)) {
      onSchedule(selectedDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Schedule Post</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Date and Time
            </label>
            <input
              type="datetime-local"
              value={selectedDate.toISOString().slice(0, 16)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full bg-gray-800 rounded p-2 text-white"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
              className="px-4 py-2 bg-blue-500 rounded-full hover:bg-blue-600"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}