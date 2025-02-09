// /app/shared/[token]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tweet, Thread, ThreadWithTweets } from "@/types/tweet";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReadOnlyTweetViewer from "../../../components/editor/ReadOnlyTweetViewer";

interface TwitterUserData {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  verified: boolean;
  verified_type?: string;
  fetchedAt: number;
}

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorId?: string;
  createdAt: string;
  position?: number;
}

interface DraftResponse {
  draft: Tweet | ThreadWithTweets;
  comments: Comment[];
  canComment: boolean;
  expiresAt: string;
  author: {
    id: string;
    name: string;
    handle: string;
    profileUrl?: string;
  };
}

export default function SharedDraftPage() {
  const params = useParams();
  const [draft, setDraft] = useState<Tweet | ThreadWithTweets | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [canComment, setCanComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<TwitterUserData | null>(null);
  const [author, setAuthor] = useState<DraftResponse["author"] | null>(null);

  // Fetch user data if logged in
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

  // Fetch draft data using the access token
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/shared-draft/${params.token}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              (response.status === 404
                ? "Draft not found or expired"
                : "Failed to load draft")
          );
        }

        const data = await response.json();
        console.log("Received data:", data);

        // Extract author data from the draft object
        const authorData = {
          id: data.draft.userId,
          name: data.draft.authorName,
          handle: data.draft.authorHandle,
          profileUrl: data.draft.authorProfileUrl || undefined,
        };

        // Create a clean draft object without author fields
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `/api/shared-draft/${params.token}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newComment.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const { comment } = await response.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  const isThread = draft && "tweetIds" in draft;

  return (
    <div className="container mx-auto px-4 py-8 lg:w-5/12">
      <Card className="mb-8 bg-red-50">
        <CardHeader>
          <h1 className="text-2xl font-bold">
            Shared {isThread ? "Thread" : "Tweet"} Draft
          </h1>
        </CardHeader>
        <CardContent>
          {draft && author && (
            <>
              <ReadOnlyTweetViewer
                tweets={
                  isThread
                    ? (draft as ThreadWithTweets).tweets
                    : [draft as Tweet]
                }
                isThread={isThread!}
                author={author}
              />
            </>
          )}
        </CardContent>
      </Card>

      {canComment && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold">Comments</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Comment Input */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                  {userData ? (
                    <img
                      src={userData.profile_image_url}
                      alt={userData.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-lg">A</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    size="sm"
                  >
                    Comment
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mt-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                      <span className="text-lg">
                        {comment.authorName[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {comment.authorName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
