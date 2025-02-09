// components/CommentForm.tsx
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommentMetadata } from "@/types/tweet";

interface CommentFormProps {
  selectedText: CommentMetadata;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  selectedText,
  onSubmit,
  onCancel,
}) => {
  const [newComment, setNewComment] = React.useState("");

  const handleSubmit = () => {
    onSubmit(newComment.trim());
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <Card className="w-full max-w-lg relative bg-white/95 shadow-2xl border-0">
        <CardHeader className="space-y-1.5">
          <h3 className="text-lg font-medium">New Comment</h3>
          <div className="bg-blue-50/50 p-3 rounded-xl text-sm border border-blue-100 text-gray-700">
            "{selectedText.highlightedContent}"
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full h-24 resize-none rounded-xl"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6"
            >
              Comment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
