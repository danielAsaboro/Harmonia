// /app/shared/[token]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Tweet,
  Thread,
  ThreadWithTweets,
  DraftResponse,
  CommentMetadata,
  Comment,
} from "@/types/tweet";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ReadOnlyTweetViewer from "../../../components/editor/ReadOnlyTweetViewer";
import { CommentList } from "@/components/comments/CommentList";
import { CommentForm } from "@/components/comments/CommentForm";

export default function SharedDraftPage() {
  const params = useParams();
  const [draft, setDraft] = useState<Tweet | ThreadWithTweets | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<"all" | "resolved" | "unresolved">(
    "all"
  );
  const [canComment, setCanComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<TwitterUserData | null>(null);
  const [author, setAuthor] = useState<DraftResponse["author"] | null>(null);
  const [selectedText, setSelectedText] = useState<CommentMetadata | null>(
    null
  );
  const [showCommentForm, setShowCommentForm] = useState(false);

  const filteredComments = comments.filter((comment) => {
    if (filter === "all") return true;
    if (filter === "resolved") return comment.resolved;
    return !comment.resolved;
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/twitter/user");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/shared-draft/${params.token}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load draft");
        }

        const data = await response.json();
        const authorData = {
          id: data.draft.userId,
          name: data.draft.authorName,
          handle: data.draft.authorHandle,
          profileUrl: data.draft.authorProfileUrl || undefined,
        };

        const { authorName, authorHandle, authorProfileUrl, ...cleanDraft } =
          data.draft;

        setDraft(cleanDraft);
        setComments(data.comments);
        setCanComment(data.canComment);
        setAuthor(authorData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      fetchDraft();
    }
  }, [params.token]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();

      if (text) {
        setSelectedText({
          tweetId: draft?.id || "",
          highlightedContent: text,
          startOffset: range.startOffset,
          endOffset: range.endOffset,
        });
        setShowCommentForm(true);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [draft]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCommentForm) {
        setShowCommentForm(false);
        setSelectedText(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showCommentForm]);

  const handleAddComment = async (userNewComment: string) => {
    if (!userNewComment.trim()) return;

    const commentData = {
      content: userNewComment.trim(),
      metadata: selectedText,
    };

    const optimisticComment: Comment = {
      id: crypto.randomUUID(),
      content: userNewComment,
      authorName: userData?.name || "Anonymous",
      authorId: userData?.id,
      createdAt: new Date().toISOString(),
      metadata: selectedText || undefined,
    };

    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment("");
    setShowCommentForm(false);
    setSelectedText(null);

    try {
      const response = await fetch(
        `/api/shared-draft/${params.token}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(commentData),
        }
      );

      if (!response.ok) throw new Error("Failed to add comment");

      const { comment } = await response.json();
      setComments((prev) =>
        prev.map((c) => (c.id === optimisticComment.id ? comment : c))
      );
    } catch (err) {
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      console.error("Error adding comment:", err);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      await fetch(`/api/shared-draft/comment/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      });

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
      );
    } catch (err) {
      console.error("Error resolving comment:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetch(`/api/shared-draft/comment/${commentId}`, {
        method: "DELETE",
      });

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const canModifyComment = (comment: Comment) =>
    userData?.id === author?.id || comment.authorId === userData?.id;

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const isThread = draft && "tweetIds" in draft;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Left side: Draft content */}
        <div className="w-7/12">
          <Card className="mb-8 sticky top-4">
            <CardHeader>
              <h1 className="text-2xl font-bold">
                Shared {isThread ? "Thread" : "Tweet"} Draft
              </h1>
            </CardHeader>
            <CardContent>
              {draft && author && (
                <ReadOnlyTweetViewer
                  tweets={
                    isThread
                      ? (draft as ThreadWithTweets).tweets
                      : [draft as Tweet]
                  }
                  isThread={isThread!}
                  author={author}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side: Comments */}
        <div className="w-5/12 relative">
          <CommentList
            comments={[...filteredComments]}
            filter={filter}
            canComment={canComment}
            onFilterChange={setFilter}
            canModifyComment={canModifyComment}
            onResolveComment={handleResolveComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </div>

      {showCommentForm && selectedText && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowCommentForm(false);
              setSelectedText(null);
            }}
          />
          <CommentForm
            selectedText={selectedText}
            onSubmit={handleAddComment}
            onCancel={() => {
              setShowCommentForm(false);
              setSelectedText(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
