// components/CommentItem.tsx
import { CheckCircle, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Comment } from "@/types/tweet";

interface CommentItemProps {
  comment: Comment;
  canModify: boolean;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  canModify,
  onResolve,
  onDelete,
}) => (
  <div
    className={`flex space-x-4 p-4 rounded-lg border ${
      comment.resolved ? "bg-gray-50/50" : "bg-white"
    }`}
  >
    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
      <span className="text-lg text-white">
        {comment.authorName[0].toUpperCase()}
      </span>
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{comment.authorName}</span>
          <span className="text-sm text-gray-500">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        {comment.resolved && (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
            Resolved
          </span>
        )}
      </div>
      {comment.metadata && (
        <div className="mt-2 text-sm border-l-4 border-blue-400 bg-blue-50 pl-4 py-2">
          <p className="text-gray-700">
            "{comment.metadata.highlightedContent}"
          </p>
        </div>
      )}
      <p className="mt-2">{comment.content}</p>
      {canModify && (
        <div className="flex justify-end gap-2 mt-2">
          {!comment.resolved && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(comment.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Resolve
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(comment.id)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      )}
    </div>
  </div>
);
