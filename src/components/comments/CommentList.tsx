// components/CommentList.tsx
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { CommentItem } from "./CommentItem";
import { Comment } from "@/types/tweet";

interface CommentListProps {
  comments: Comment[];
  filter: "all" | "resolved" | "unresolved";
  canComment: boolean;
  onFilterChange: (filter: "all" | "resolved" | "unresolved") => void;
  canModifyComment: (comment: Comment) => boolean;
  onResolveComment: (id: string) => void;
  onDeleteComment: (id: string) => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  filter,
  canComment,
  onFilterChange,
  canModifyComment,
  onResolveComment,
  onDeleteComment,
}) => {
  const filteredComments = comments.filter((comment) => {
    if (filter === "all") return true;
    if (filter === "resolved") return comment.resolved;
    return !comment.resolved;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Comments</h2>
          {!canComment && (
            <div className="flex items-center text-gray-500 text-sm">
              <Lock className="w-4 h-4 mr-1" />
              Comments are disabled
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter !== "all" ? "default" : "outline"}
            onClick={() => onFilterChange("all")}
          >
            All
          </Button>
          <Button
            variant={filter !== "resolved" ? "default" : "outline"}
            onClick={() => onFilterChange("resolved")}
          >
            Resolved
          </Button>
          <Button
            variant={filter !== "unresolved" ? "default" : "outline"}
            onClick={() => onFilterChange("unresolved")}
          >
            Unresolved
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {canComment && (
            <p className="text-sm text-gray-500">
              Select text to add a comment
            </p>
          )}
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canModify={canModifyComment(comment)}
                onResolve={onResolveComment}
                onDelete={onDeleteComment}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
