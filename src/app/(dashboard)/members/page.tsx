// /members/page.tsx

"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Send,
  Mail,
  Twitter,
  Github,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ProjectHistory {
  name: string;
  role: string;
  date: string;
  description: string;
}

interface MatchHistory {
  query: string;
  date: string;
  matched: boolean;
}

interface Member {
  id: string;
  name: string;
  skills: string[];
  matchReason: string;
  profileImage?: string;
  matchPercentage: number;
  email: string;
  twitter: string;
  github: string;
  linkedin: string;
  bio: string;
  location: string;
  timezone: string;
  availability: string;
  projectHistory: ProjectHistory[];
  matchHistory: MatchHistory[];
  achievements: string[];
}

const MemberFinder = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Member[]>([
    {
      id: "1",
      name: "Alex Nguyen",
      skills: ["Rust", "DeFi", "API Integration", "Solana", "React"],
      matchReason:
        "Extensive experience in Rust-based DeFi development with proven track record in Solana ecosystem",
      matchPercentage: 95,
      email: "alex@example.com",
      twitter: "@alex_dev",
      github: "alexdev",
      linkedin: "alex-nguyen",
      bio: "Senior blockchain developer specializing in Rust and Solana. 5+ years of DeFi experience.",
      location: "San Francisco, CA",
      timezone: "PST",
      availability: "Part-time",
      projectHistory: [
        {
          name: "DeFi Protocol X",
          role: "Lead Developer",
          date: "2024-01",
          description: "Built a comprehensive DeFi protocol handling $10M+ TVL",
        },
        {
          name: "NFT Marketplace Y",
          role: "Senior Engineer",
          date: "2023-12",
          description: "Developed smart contracts and backend infrastructure",
        },
      ],
      matchHistory: [
        {
          query: "Rust DeFi developer",
          date: "2024-02-01",
          matched: true,
        },
      ],
      achievements: [
        "Solana Foundation Grant Recipient 2024",
        "Top 3 SuperteamDAO Contributor",
      ],
    },
    {
      id: "2",
      name: "Sarah Chen",
      skills: ["Rust", "Solana", "Smart Contracts", "TypeScript", "Web3"],
      matchReason:
        "Deep expertise in Solana ecosystem with focus on DeFi protocols",
      matchPercentage: 88,
      email: "sarah@example.com",
      twitter: "@sarah_web3",
      github: "sarahchen",
      linkedin: "sarah-chen",
      bio: "Blockchain architect focused on Solana ecosystem. Previously at Major DeFi Protocol.",
      location: "Singapore",
      timezone: "SGT",
      availability: "Full-time",
      projectHistory: [
        {
          name: "Lending Protocol Z",
          role: "Tech Lead",
          date: "2024-01",
          description: "Architected and implemented lending protocol",
        },
      ],
      matchHistory: [
        {
          query: "Solana developer",
          date: "2024-01-15",
          matched: true,
        },
      ],
      achievements: [
        "Winner Solana Hackathon 2023",
        "Speaker at Breakpoint 2024",
      ],
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to get matches
    console.log("Searching for:", query);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-gray-900 rounded-2xl p-8 space-y-8">
      <header className="space-y-3">
        <h1 className="text-white text-3xl font-bold">
          Superteam Member Finder
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Find the perfect Superteam member to match your community needs. Just
          describe your requirements, and I'll suggest the most relevant
          member(s) or let you know if no match exists.{" "}
        </p>
      </header>

      <hr className="border-gray-700" />

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your project needs..."
            className="pl-12 bg-gray-800 border-gray-700 text-white h-14 text-lg"
          />
        </div>
        <Button
          type="submit"
          className="h-14 px-8 bg-white text-gray-900 hover:bg-gray-100 text-lg"
        >
          <Send className="w-5 h-5 mr-2" />
          Find Matches
        </Button>
      </form>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-gray-300 text-xl font-semibold">
            Suggested Matches
          </h2>
          <span className="text-gray-400">
            {suggestions.length} matches found
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {suggestions.map((member) => (
            <Card
              key={member.id}
              className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all"
            >
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-white text-xl font-semibold">
                        {member.name}
                      </h3>
                      <p className="text-gray-400">
                        {member.location} • {member.timezone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-900 text-green-300 px-3 py-1"
                      >
                        {member.matchPercentage}% Match
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-blue-900 text-blue-300 px-3 py-1"
                      >
                        {member.availability}
                      </Badge>
                    </div>
                  </div>
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-2xl text-white">
                        {member.name[0]}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-gray-300 text-sm line-clamp-2">
                  {member.bio}
                </p>

                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="bg-gray-700 text-gray-300 border-gray-600"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-gray-300 font-semibold">
                    Why this match?
                  </h4>
                  <p className="text-gray-400 text-sm">{member.matchReason}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Link
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </Link>
                  </div>
                  <div className="flex gap-4">
                    <Link
                      href={`https://twitter.com/${member.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <Twitter className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <Github className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`https://linkedin.com/in/${member.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <Linkedin className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                <Link
                  href={`/members/${member.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white gap-2">
                    View Full Profile
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberFinder;
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
