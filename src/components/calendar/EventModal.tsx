// /components/calendar/EventModal.tsx
import React from "react";
import { X, Clock, Tag, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CalendarEvent } from "./types";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (event: CalendarEvent) => void;
  event?: CalendarEvent;
  defaultDate?: Date;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  defaultDate,
}: EventModalProps) {
  const [formData, setFormData] = React.useState<Partial<CalendarEvent>>({
    title: event?.title || "",
    start: event?.start || defaultDate || new Date(),
    end: event?.end || defaultDate || new Date(),
    type: event?.type || "community",
    tags: event?.tags || [],
  });

  const [newTag, setNewTag] = React.useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && event) {
      onDelete(event);
      onClose();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && formData.tags) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (formData.tags) {
      setFormData({
        ...formData,
        tags: formData.tags.filter((tag) => tag !== tagToRemove),
      });
    }
  };

  const isValidDate = (date: Date | undefined): date is Date => {
    return date !== undefined && date instanceof Date && !isNaN(date.getTime());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">
            {event ? "Edit Event" : "Create Event"}
          </h2>
          <div className="flex items-center gap-2">
            {event && onDelete && (
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Event title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start</label>
                <div className="relative">
                  <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="datetime-local"
                    value={
                      isValidDate(formData.start)
                        ? format(formData.start, "yyyy-MM-dd'T'HH:mm")
                        : format(new Date(), "yyyy-MM-dd'T'HH:mm")
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        start: new Date(e.target.value),
                      })
                    }
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End</label>
                <div className="relative">
                  <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="datetime-local"
                    value={
                      isValidDate(formData.end)
                        ? format(formData.end, "yyyy-MM-dd'T'HH:mm")
                        : format(new Date(), "yyyy-MM-dd'T'HH:mm")
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        end: new Date(e.target.value),
                      })
                    }
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Event Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as CalendarEvent["type"],
                  })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="community">Community</option>
                <option value="educational">Educational</option>
                <option value="meme">Meme</option>
                <option value="challenge">Challenge</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {formData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-gray-100 text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {event ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
