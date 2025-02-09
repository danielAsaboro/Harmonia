// /system-config/page.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Key,
  Shield,
  Save,
  Database,
  Check,
  AlertCircle,
  Download,
  Upload,
} from "lucide-react";
// System Status Types
export type SystemStatus = {
  llmStatus: "operational" | "degraded" | "down";
  lastBackup: string;
  activeUsers: number;
  modelVersion: string;
};

// LLM Configuration Types
export type ModelType = "llama2-70b" | "llama2-13b" | "mixtral-8x7b";

export interface LLMConfig {
  model: ModelType;
  temperature: number;
  maxTokens: number;
}

// API Configuration Types
export interface APIConfig {
  telegramToken: string;
  twitterApiKey: string;
  rateLimit: number;
}

// Privacy Configuration Types
export interface PrivacyConfig {
  dataRetentionDays: number;
  enableAnalytics: boolean;
  localStorageOnly: boolean;
}

// Backup Configuration Types
export type BackupSchedule = "daily" | "weekly" | "monthly";

export interface BackupConfig {
  schedule: BackupSchedule;
  location: string;
  retentionCount: number;
}

// Combined Configuration Type
export interface SystemConfig {
  llm: LLMConfig;
  api: APIConfig;
  privacy: PrivacyConfig;
  backup: BackupConfig;
}

// Status Card Props
export interface StatusCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

// Configuration Section Props
export interface ConfigSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}
// Reusable Status Card Component
const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon,
  className,
}) => (
  <Card variant="glass" className={className}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <div className="flex items-center gap-2">
            {icon}
            <p className="font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Reusable Configuration Section Component
const ConfigSection: React.FC<ConfigSectionProps> = ({
  title,
  icon,
  children,
}) => (
  <Card variant="elevated">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

export default function DashboardPage() {
  // State Management
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    llmStatus: "operational",
    lastBackup: "2024-01-14 09:00",
    activeUsers: 12,
    modelVersion: "llama2-70b",
  });

  const [config, setConfig] = useState<SystemConfig>({
    llm: {
      model: "llama2-70b",
      temperature: 0.7,
      maxTokens: 2048,
    },
    api: {
      telegramToken: "",
      twitterApiKey: "",
      rateLimit: 60,
    },
    privacy: {
      dataRetentionDays: 30,
      enableAnalytics: true,
      localStorageOnly: true,
    },
    backup: {
      schedule: "daily",
      location: "/backups",
      retentionCount: 5,
    },
  });

  // Event Handlers
  const handleConfigUpdate = (
    section: keyof SystemConfig,
    key: string,
    value: any
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    // Implementation for saving changes
    console.log("Saving configuration:", config);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            System Configuration
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Manage your system settings and configurations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Backup
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Restore
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={handleSaveChanges}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatusCard
          title="LLM Status"
          value={systemStatus.llmStatus}
          icon={
            systemStatus.llmStatus === "operational" ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )
          }
        />
        <StatusCard title="Model Version" value={systemStatus.modelVersion} />
        <StatusCard title="Active Users" value={systemStatus.activeUsers} />
        <StatusCard title="Last Backup" value={systemStatus.lastBackup} />
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-2 gap-6">
        {/* LLM Configuration */}
        <ConfigSection
          title="LLM Configuration"
          icon={<Settings className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-zinc-900 dark:text-zinc-50">
                Model Selection
              </label>
              <Select
                value={config.llm.model}
                onValueChange={(value: ModelType) =>
                  handleConfigUpdate("llm", "model", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama2-70b">Llama2 70B</SelectItem>
                  <SelectItem value="llama2-13b">Llama2 13B</SelectItem>
                  <SelectItem value="mixtral-8x7b">Mixtral 8x7B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-zinc-900 dark:text-zinc-50">
                Temperature
              </label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={config.llm.temperature}
                onChange={(e) =>
                  handleConfigUpdate(
                    "llm",
                    "temperature",
                    parseFloat(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-zinc-900 dark:text-zinc-50">
                Max Tokens
              </label>
              <Input
                type="number"
                value={config.llm.maxTokens}
                onChange={(e) =>
                  handleConfigUpdate(
                    "llm",
                    "maxTokens",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          </div>
        </ConfigSection>

        {/* API Configuration */}
        <ConfigSection
          title="API Configuration"
          icon={<Key className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-zinc-900 dark:text-zinc-50">
                Telegram Bot Token
              </label>
              <Input
                type="password"
                value={config.api.telegramToken}
                onChange={(e) =>
                  handleConfigUpdate("api", "telegramToken", e.target.value)
                }
                placeholder="Enter Telegram Bot Token"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-zinc-900 dark:text-zinc-50">
                Twitter API Key
              </label>
              <Input
                type="password"
                value={config.api.twitterApiKey}
                onChange={(e) =>
                  handleConfigUpdate("api", "twitterApiKey", e.target.value)
                }
                placeholder="Enter Twitter API Key"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-zinc-900 dark:text-zinc-50">
                Rate Limiting
              </label>
              <Input
                type="number"
                value={config.api.rateLimit}
                onChange={(e) =>
                  handleConfigUpdate(
                    "api",
                    "rateLimit",
                    parseInt(e.target.value)
                  )
                }
                placeholder="Requests per minute"
              />
            </div>
          </div>
        </ConfigSection>

        {/* Privacy Controls */}
        <ConfigSection
          title="Privacy Controls"
          icon={<Shield className="w-5 h-5" />}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Data Retention Period (days)
              </label>
              <Input
                type="number"
                className="w-24"
                value={config.privacy.dataRetentionDays}
                onChange={(e) =>
                  handleConfigUpdate(
                    "privacy",
                    "dataRetentionDays",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Enable Usage Analytics
              </label>
              <Switch
                checked={config.privacy.enableAnalytics}
                onCheckedChange={(checked) =>
                  handleConfigUpdate("privacy", "enableAnalytics", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Store User Data Locally Only
              </label>
              <Switch
                checked={config.privacy.localStorageOnly}
                onCheckedChange={(checked) =>
                  handleConfigUpdate("privacy", "localStorageOnly", checked)
                }
              />
            </div>
          </div>
        </ConfigSection>

        {/* Backup & Restore */}
        <ConfigSection
          title="Backup & Restore"
          icon={<Database className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-zinc-900 dark:text-zinc-50">
                Backup Schedule
              </label>
              <Select
                value={config.backup.schedule}
                onValueChange={(value: BackupSchedule) =>
                  handleConfigUpdate("backup", "schedule", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-zinc-900 dark:text-zinc-50">
                Backup Location
              </label>
              <Input
                value={config.backup.location}
                onChange={(e) =>
                  handleConfigUpdate("backup", "location", e.target.value)
                }
                placeholder="Enter backup path"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-zinc-900 dark:text-zinc-50">
                Retention Count
              </label>
              <Input
                type="number"
                value={config.backup.retentionCount}
                onChange={(e) =>
                  handleConfigUpdate(
                    "backup",
                    "retentionCount",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
}
