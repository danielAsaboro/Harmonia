// /app/calendar/page.tsx
"use client";
import { useEffect, useState } from "react";
import CalendarView from "@/components/calendar/CalendarView";
import { CalendarEvent, CalendarEventType } from "@/components/calendar/types";
import { tweetStorage } from "@/utils/localStorage";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const loadScheduledContent = () => {
      // Get standalone scheduled tweets (those without threadId)
      const tweets = tweetStorage
        .getTweets()
        .filter((t) => t.status === "scheduled" && !t.threadId);

      // Get threads and their first tweets
      const threads = tweetStorage
        .getThreads()
        .filter((t) => t.status === "scheduled");
      const threadFirstTweets: CalendarEvent[] = threads.map((thread) => {
        const firstTweet = tweetStorage.getThreadPreview(thread.id);
        return {
          id: thread.id,
          title: firstTweet
            ? `Thread: ${firstTweet.content.slice(0, 40)}...`
            : `Thread (${thread.tweetIds.length} tweets)`,
          start: new Date(thread.scheduledFor!),
          end: new Date(thread.scheduledFor!),
          type: "community" as CalendarEventType,
          isDeletable: true,
        };
      });

      // Convert standalone tweets to calendar events
      const tweetEvents: CalendarEvent[] = tweets.map((tweet) => ({
        id: tweet.id,
        title:
          tweet.content.slice(0, 50) + (tweet.content.length > 50 ? "..." : ""),
        start: new Date(tweet.scheduledFor!),
        end: new Date(tweet.scheduledFor!),
        type: "community" as CalendarEventType,
        isDeletable: true,
      }));

      // Combine standalone tweets and thread first tweets
      setEvents([...tweetEvents, ...threadFirstTweets]);
    };

    loadScheduledContent();
    const intervalId = setInterval(loadScheduledContent, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleEventCreate = (eventData: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: eventData.title || "Untitled",
      start: eventData.start || new Date(),
      end: eventData.end || new Date(),
      type: (eventData.type || "community") as CalendarEventType,
      isDeletable: true,
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents((prev) => {
      const newEvents = prev.map((event) => {
        if (event.id === updatedEvent.id) {
          // Check if this is a scheduled tweet/thread by ID lookup
          const tweet = tweetStorage.getTweets().find((t) => t.id === event.id);
          const thread = tweetStorage
            .getThreads()
            .find((t) => t.id === event.id);

          if (tweet) {
            const updatedTweet = {
              ...tweet,
              scheduledFor: updatedEvent.start,
            };
            tweetStorage.saveTweet(updatedTweet, true);
          } else if (thread) {
            const updatedThread = {
              ...thread,
              scheduledFor: updatedEvent.start,
            };
            tweetStorage.saveThread(updatedThread, [], true);
          }
          return updatedEvent;
        }
        return event;
      });
      return newEvents;
    });
  };

  const handleEventDrop = (event: CalendarEvent, start: Date, end: Date) => {
    const updatedEvent = {
      ...event,
      start,
      end: start, // For tweets/threads, end time is same as start
    };
    handleEventUpdate(updatedEvent);
  };

  const handleEventDelete = (eventToDelete: CalendarEvent) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventToDelete.id));

    // Check if this is a scheduled tweet/thread by ID lookup
    const tweet = tweetStorage
      .getTweets()
      .find((t) => t.id === eventToDelete.id);
    const thread = tweetStorage
      .getThreads()
      .find((t) => t.id === eventToDelete.id);

    if (tweet) {
      const updatedTweet = {
        ...tweet,
        status: "draft" as const,
        scheduledFor: undefined,
      };
      tweetStorage.saveTweet(updatedTweet, true);
    } else if (thread) {
      const updatedThread = {
        ...thread,
        status: "draft" as const,
        scheduledFor: undefined,
      };
      tweetStorage.saveThread(updatedThread, [], true);
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-100">
      <CalendarView
        events={events}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDrop={handleEventDrop}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
}
