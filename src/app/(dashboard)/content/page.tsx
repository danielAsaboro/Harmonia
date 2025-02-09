// /content/page.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Twitter,
  MessageCircle,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";

// Type definitions
interface PendingPost {
  id: string;
  type: "twitter" | "telegram";
  content: string;
  scheduledFor: string;
  status: "pending" | "approved";
}

interface TwitterAnalytics {
  impressions: number;
  engagement: number;
  topPost: string;
}

interface TelegramAnalytics {
  responses: number;
  avgResponseTime: string;
  activeTemplates: number;
}

interface Analytics {
  twitter: TwitterAnalytics;
  telegram: TelegramAnalytics;
}

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  href: string;
}

interface MetricDisplay {
  label: string;
  value: string | number;
  type: "number" | "percentage" | "text" | "time";
}

interface PlatformAnalytics {
  platform: string;
  icon: LucideIcon;
  color: string;
  metrics: MetricDisplay[];
}

export default function ContentStudioPage() {
  const pendingPosts: PendingPost[] = [
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

  const analytics: Analytics = {
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

  const quickActions: QuickAction[] = [
    {
      title: "Twitter Composer",
      description: "Create and schedule tweets",
      icon: Twitter,
      color: "text-blue-500",
      href: "/content/compose/twitter",
    },
    {
      title: "Response Templates",
      description: "Manage Telegram responses",
      icon: MessageCircle,
      color: "text-purple-500",
      href: "/content/templates",
    },
    {
      title: "Content Calendar",
      description: "View scheduled content",
      icon: Calendar,
      color: "text-green-500",
      href: "/content/calendar",
    },
  ];

  const platformAnalytics: PlatformAnalytics[] = [
    {
      platform: "Twitter",
      icon: Twitter,
      color: "text-blue-500",
      metrics: [
        {
          label: "Impressions",
          value: analytics.twitter.impressions.toLocaleString(),
          type: "number",
        },
        {
          label: "Engagement",
          value: `${analytics.twitter.engagement}%`,
          type: "percentage",
        },
        { label: "Top Post", value: analytics.twitter.topPost, type: "text" },
      ],
    },
    {
      platform: "Telegram",
      icon: MessageCircle,
      color: "text-purple-500",
      metrics: [
        {
          label: "Responses",
          value: analytics.telegram.responses,
          type: "number",
        },
        {
          label: "Avg Response Time",
          value: analytics.telegram.avgResponseTime,
          type: "time",
        },
        {
          label: "Active Templates",
          value: analytics.telegram.activeTemplates,
          type: "number",
        },
      ],
    },
  ];

  const getMetricClassName = (type: MetricDisplay["type"]): string => {
    switch (type) {
      case "text":
        return "text-sm truncate";
      default:
        return "text-lg";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header Section with improved spacing and hierarchy */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Content Studio
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Manage and schedule your social media content
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Template
          </Button>
          <Button className="flex items-center gap-2">
            <Twitter className="w-4 h-4" />
            New Tweet
          </Button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link href={action.href} key={action.title}>
            <Card
              variant="glass"
              className="transition-all duration-200 hover:scale-[1.02]"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {action.description}
                    </p>
                  </div>
                  <action.icon className={`w-8 h-8 ${action.color}`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Content Management & Analytics Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pending Content */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <Clock className="w-5 h-5 text-zinc-500" />
              Pending Content
            </CardTitle>
            <CardDescription>
              Content awaiting review or scheduled for posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    {post.type === "twitter" ? (
                      <Twitter className="w-4 h-4 text-blue-500" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-purple-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate w-48">
                        {post.content}
                      </p>
                      <p className="text-xs text-zinc-500">
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
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <TrendingUp className="w-5 h-5 text-zinc-500" />
              Analytics Overview
            </CardTitle>
            <CardDescription>
              Performance metrics across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {platformAnalytics.map((platform) => (
                <div key={platform.platform} className="space-y-3">
                  <div className={`flex items-center gap-2 ${platform.color}`}>
                    <platform.icon className="w-4 h-4" />
                    <h4 className="font-semibold">
                      {platform.platform} Performance
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {platform.metrics.map((metric) => (
                      <div key={metric.label}>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {metric.label}
                        </p>
                        <p
                          className={`${getMetricClassName(
                            metric.type
                          )} font-bold text-zinc-900 dark:text-zinc-50`}
                        >
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
