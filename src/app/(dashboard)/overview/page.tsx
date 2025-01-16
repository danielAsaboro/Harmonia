// /overview/page.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Check,
  Twitter,
  MessageCircle,
  Users,
  FileText,
  ActivitySquare,
} from "lucide-react";

export default function OverviewPage() {
  // Mock data - replace with real data fetching
  const systemStatus = {
    llm: "operational",
    telegram: "operational",
    twitter: "degraded",
  };

  const quickStats = {
    activeDocuments: 24,
    pendingTweets: 3,
    recentQueries: 156,
    activeUsers: 89,
  };

  const recentActivity = [
    {
      type: "query",
      message: "Rust developer inquiry matched with @dev_name",
      time: "2 mins ago",
    },
    {
      type: "tweet",
      message: "New tweet draft created for review",
      time: "15 mins ago",
    },
    {
      type: "document",
      message: "New knowledge base document uploaded",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Overview</h1>
        <div className="flex gap-4">
          <Button className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Upload Document
          </Button>
          <Button className="flex items-center gap-2">
            <Twitter className="w-4 h-4" />
            New Tweet
          </Button>
        </div>
      </div>

      {/* System Status Section */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LLM Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {systemStatus.llm === "operational" ? (
                <Check className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="capitalize">{systemStatus.llm}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Telegram Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {systemStatus.telegram === "operational" ? (
                <Check className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="capitalize">{systemStatus.telegram}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Twitter API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {systemStatus.twitter === "operational" ? (
                <Check className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
              )}
              <span className="capitalize">{systemStatus.twitter}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <FileText className="w-4 h-4" />
              <span className="text-2xl font-bold">
                {quickStats.activeDocuments}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Tweets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Twitter className="w-4 h-4" />
              <span className="text-2xl font-bold">
                {quickStats.pendingTweets}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <MessageCircle className="w-4 h-4" />
              <span className="text-2xl font-bold">
                {quickStats.recentQueries}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Users className="w-4 h-4" />
              <span className="text-2xl font-bold">
                {quickStats.activeUsers}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
              >
                <ActivitySquare className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard (Main Overview)

// System Status (LLM, Telegram Bot, Twitter API)
// Recent Interactions
// Content Queue
// Performance Metrics
// Primary workspace for all operations. Single-page layout with:

// Quick stats: Active documents, pending tweets, recent queries
// Action buttons for main functions
// Recent activity feed
// System status indicator (LLM availability)
