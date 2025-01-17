// /system-config/page.tsx
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Key,
  Users,
  Shield,
  Save,
  Database,
  Check,
  AlertCircle,
  Download,
  Upload,
} from "lucide-react";

export default function DashboardPage() {
  // Mock system status
  const [systemStatus, setSystemStatus] = useState({
    llmStatus: "operational",
    lastBackup: "2024-01-14 09:00",
    activeUsers: 12,
    modelVersion: "llama2-70b",
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Backup
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Restore
          </Button>
          <Button className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">LLM Status</p>
                <div className="flex items-center gap-2">
                  {systemStatus.llmStatus === "operational" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <p className="font-bold capitalize">
                    {systemStatus.llmStatus}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Model Version</p>
              <p className="font-bold">{systemStatus.modelVersion}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="font-bold">{systemStatus.activeUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Last Backup</p>
              <p className="font-bold">{systemStatus.lastBackup}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-2 gap-6">
        {/* LLM Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              LLM Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Model Selection</label>
              <select className="w-full mt-1 p-2 border rounded-md bg-transparent">
                <option value="llama2-70b">Llama2 70B</option>
                <option value="llama2-13b">Llama2 13B</option>
                <option value="mixtral-8x7b">Mixtral 8x7B</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Temperature</label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.7"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Tokens</label>
              <Input type="number" defaultValue="2048" />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Telegram Bot Token</label>
              <Input type="password" placeholder="Enter Telegram Bot Token" />
            </div>
            <div>
              <label className="text-sm font-medium">Twitter API Key</label>
              <Input type="password" placeholder="Enter Twitter API Key" />
            </div>
            <div>
              <label className="text-sm font-medium">Rate Limiting</label>
              <Input
                type="number"
                placeholder="Requests per minute"
                defaultValue="60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Data Retention Period (days)
              </label>
              <Input type="number" className="w-24" defaultValue="30" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Enable Usage Analytics
              </label>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Store User Data Locally Only
              </label>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Backup & Restore
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Backup Schedule</label>
              <select className="w-full mt-1 p-2 border rounded-md bg-transparent">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Backup Location</label>
              <Input placeholder="Enter backup path" defaultValue="/backups" />
            </div>
            <div>
              <label className="text-sm font-medium">Retention Count</label>
              <Input type="number" defaultValue="5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
