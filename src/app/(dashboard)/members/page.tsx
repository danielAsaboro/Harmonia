// /members/page.tsx
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  Upload,
  UserPlus,
  Mail,
  Twitter,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  skills: string[];
  twitter: string;
  email: string;
  projectHistory: {
    name: string;
    role: string;
    date: string;
  }[];
  matchHistory: {
    query: string;
    date: string;
    matched: boolean;
  }[];
}

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Mock data - replace with actual data fetching
  const members: Member[] = [
    {
      id: "1",
      name: "Jane Doe",
      skills: ["Rust", "DeFi", "Smart Contracts"],
      twitter: "@jane_dev",
      email: "jane@example.com",
      projectHistory: [
        {
          name: "DeFi Protocol",
          role: "Lead Developer",
          date: "2024-12",
        },
      ],
      matchHistory: [
        {
          query: "Rust developer for DeFi project",
          date: "2024-01-10",
          matched: true,
        },
      ],
    },
    // Add more mock members here
  ];

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import JSON
          </Button>
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Search and Members List */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search members or skills..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedMember(member)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Member Profile View */}
        <div className="col-span-2">
          {selectedMember ? (
            <Card>
              <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {selectedMember.name}
                    </CardTitle>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {selectedMember.email}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Twitter className="w-4 h-4" />
                        {selectedMember.twitter}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Skills Matrix */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Project History */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Project History
                  </h3>
                  <div className="space-y-3">
                    {selectedMember.projectHistory.map((project, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-gray-500">
                            {project.role}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {project.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match History */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Match History</h3>
                  <div className="space-y-3">
                    {selectedMember.matchHistory.map((match, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{match.query}</p>
                          <p className="text-sm text-gray-500">{match.date}</p>
                        </div>
                        <Badge
                          variant={match.matched ? "success" : "secondary"}
                        >
                          {match.matched ? "Matched" : "Not Matched"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a member to view their profile
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// Member list view

// Searchable table
// Key skills highlight
// Quick contact action

// Member profile view

// Skills matrix
// Contact information
// Project history

// Simple JSON import/export interface

// Member Database Interface
// Skill/Experience Tagging
// Member Matching Rules
// Match History
// Database Updates
