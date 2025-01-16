// /content/page.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Twitter,
  MessageCircle,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function ContentStudioPage() {
  // Mock data - replace with actual data fetching
  const pendingPosts = [
    {
      id: "1",
      type: "twitter",
      content: "Exciting news! Join our upcoming...",
      scheduledFor: "2024-01-15 14:00",
      status: "pending",
    },
    {
      id: "2",
      type: "telegram",
      content: "Welcome to all new members...",
      scheduledFor: "2024-01-15 15:30",
      status: "approved",
    },
  ];

  const analytics = {
    twitter: {
      impressions: 12500,
      engagement: 3.2,
      topPost: "Announcement: New bounty program...",
    },
    telegram: {
      responses: 245,
      avgResponseTime: "2.5m",
      activeTemplates: 12,
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Studio</h1>
        <div className="flex gap-4">
          <Link href="/content/compose/twitter">
            <Button className="flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              New Tweet
            </Button>
          </Link>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            New Template
          </Button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="hover:bg-gray-50 cursor-pointer">
          <Link href="/content/compose/twitter">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Twitter Composer
                  </h3>
                  <p className="text-gray-500">Create and schedule tweets</p>
                </div>
                <Twitter className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-gray-50 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Response Templates
                </h3>
                <p className="text-gray-500">Manage Telegram responses</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-gray-50 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">Content Calendar</h3>
                <p className="text-gray-500">View scheduled content</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Content & Analytics */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pending Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {post.type === "twitter" ? (
                      <Twitter className="w-4 h-4 text-blue-400" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-purple-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium truncate w-48">
                        {post.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {post.scheduledFor}
                      </p>
                    </div>
                  </div>
                  {post.status === "approved" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Twitter Analytics */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <Twitter className="w-4 h-4" />
                  <h4 className="font-semibold">Twitter Performance</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Impressions</p>
                    <p className="text-lg font-bold">
                      {analytics.twitter.impressions.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Engagement</p>
                    <p className="text-lg font-bold">
                      {analytics.twitter.engagement}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Top Post</p>
                    <p className="text-sm font-medium truncate">
                      {analytics.twitter.topPost}
                    </p>
                  </div>
                </div>
              </div>

              {/* Telegram Analytics */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-400">
                  <MessageCircle className="w-4 h-4" />
                  <h4 className="font-semibold">Telegram Performance</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Responses</p>
                    <p className="text-lg font-bold">
                      {analytics.telegram.responses}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Response Time</p>
                    <p className="text-lg font-bold">
                      {analytics.telegram.avgResponseTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Templates</p>
                    <p className="text-lg font-bold">
                      {analytics.telegram.activeTemplates}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Content Studio

// Twitter Post Composer [link to /content/compose/twitter]
// Telegram Response Templates
// Content Calendar
// Approval Workflow
// Post Analytics
