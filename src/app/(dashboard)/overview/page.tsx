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
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function OverviewPage() {
  const systemStatus = {
    llm: "operational",
    telegram: "operational",
    twitter: "degraded",
  };

  const quickStats = {
    activeDocuments: {
      value: 24,
      trend: "up",
      change: "+12%",
    },
    pendingTweets: {
      value: 3,
      trend: "down",
      change: "-2",
    },
    recentQueries: {
      value: 156,
      trend: "up",
      change: "+23%",
    },
    activeUsers: {
      value: 89,
      trend: "up",
      change: "+5%",
    },
  };

  const recentActivity = [
    {
      type: "query",
      message: "Rust developer inquiry matched with @dev_name",
      time: "2 mins ago",
      icon: MessageCircle,
    },
    {
      type: "tweet",
      message: "New tweet draft created for review",
      time: "15 mins ago",
      icon: Twitter,
    },
    {
      type: "document",
      message: "New knowledge base document uploaded",
      time: "1 hour ago",
      icon: FileText,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-500 bg-green-50 dark:bg-green-500/10";
      case "degraded":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10";
      default:
        return "text-red-500 bg-red-50 dark:bg-red-500/10";
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <ArrowUp className="w-3 h-3 text-green-500" />
    ) : (
      <ArrowDown className="w-3 h-3 text-red-500" />
    );
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            System Overview
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time monitoring and system status
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Upload Document
          </Button>
          <Button className="gap-2">
            <Twitter className="w-4 h-4" />
            New Tweet
          </Button>
        </div>
      </div>

      {/* System Status Section */}
      <Card variant="glass" className="border-none">
        <CardHeader>
          <CardTitle className="text-base">System Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-6">
          {Object.entries(systemStatus).map(([key, status]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3">
                {key === "llm" && (
                  <ActivitySquare className="w-5 h-5 text-zinc-500" />
                )}
                {key === "telegram" && (
                  <MessageCircle className="w-5 h-5 text-zinc-500" />
                )}
                {key === "twitter" && (
                  <Twitter className="w-5 h-5 text-zinc-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {key.toUpperCase()}
                  </p>
                  <div
                    className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${getStatusColor(
                      status
                    )}`}
                  >
                    {status}
                  </div>
                </div>
              </div>
              {status === "operational" ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle
                  className={`w-5 h-5 ${
                    status === "degraded" ? "text-yellow-500" : "text-red-500"
                  }`}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6">
        {Object.entries(quickStats).map(([key, data]) => (
          <Card key={key} variant="elevated" className="border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {key === "activeDocuments" && <FileText className="w-4 h-4" />}
                {key === "pendingTweets" && <Twitter className="w-4 h-4" />}
                {key === "recentQueries" && (
                  <MessageCircle className="w-4 h-4" />
                )}
                {key === "activeUsers" && <Users className="w-4 h-4" />}
                {key.split(/(?=[A-Z])/).join(" ")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {data.value}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(data.trend)}
                  <span
                    className={
                      data.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {data.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <Card variant="default" className="border-none">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <Icon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      {activity.message}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
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
