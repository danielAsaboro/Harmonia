// /app/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Twitter,
  MessagesSquare,
  ShieldCheck,
  Zap,
  Users,
  Clock,
  Brain,
  Database,
  Shield,
  Sparkles,
  ArrowDown,
  MessageCircle,
  // Telegram,
  Code,
  Upload,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import {
  FeatureCardProps,
  IntegrationCardProps,
  StatCardProps,
  StepCardProps,
} from "@/types/landing";
import MentionInput from "@/components/ui/tags";

const StatCard = ({ value, label, icon: Icon }: StatCardProps) => {
  const [count, setCount] = useState(0);

  // Animate count on view
  const animateCount = () => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onViewportEnter={animateCount}
      className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
    >
      <Icon className="h-8 w-8 text-blue-500 mb-4" />
      <div className="text-3xl font-bold text-slate-800 mb-2">
        {count.toLocaleString()}+
      </div>
      <div className="text-slate-600">{label}</div>
    </motion.div>
  );
};

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  gradient,
}: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative group"
  >
    <div
      className={`absolute inset-0 rounded-2xl ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
    />
    <Card className="relative p-6 bg-white/80 backdrop-blur-sm border border-blue-100 hover:border-blue-200 transition-all">
      <Icon className="h-10 w-10 text-blue-600 mb-4" />
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </Card>
  </motion.div>
);

const StepCard = ({
  number,
  title,
  description,
  icon: Icon,
}: StepCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative flex flex-col items-center"
  >
    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
      {number}
    </div>
    <Icon className="w-8 h-8 text-blue-600 mb-4" />
    <h3 className="text-xl font-semibold text-slate-800 mb-2 text-center">
      {title}
    </h3>
    <p className="text-slate-600 text-center max-w-sm">{description}</p>
  </motion.div>
);

const IntegrationCard = ({
  platform,
  icon: Icon,
  metrics,
}: IntegrationCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:border-blue-300 transition-all"
  >
    <div className="flex items-center gap-4 mb-6">
      <Icon className="w-10 h-10 text-blue-600" />
      <h3 className="text-xl font-semibold text-slate-800">{platform}</h3>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="text-center">
          <div className="text-2xl font-bold text-blue-600">{metric.value}</div>
          <div className="text-sm text-slate-600">{metric.label}</div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-400/10 to-green-400/10 animate-gradient" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900"
            >
              AI-Powered Community
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                {" "}
                Management
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600"
            >
              Streamline your community engagement with AI-driven solutions for
              Telegram and Twitter management
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/overview">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl text-lg font-semibold"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-200 hover:border-blue-300 px-8 py-6 rounded-xl text-lg font-semibold"
              >
                View Demo
              </Button>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16"
            >
              {[
                { icon: Bot, text: "Knowledge Bot" },
                { icon: MessagesSquare, text: "Member Finder" },
                { icon: Twitter, text: "Twitter Management" },
                { icon: ShieldCheck, text: "Local LLM Security" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-blue-100 hover:border-blue-200 transition-all"
                >
                  <feature.icon className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-slate-700">
                    {feature.text}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              value={50000}
              label="Messages Processed"
              icon={MessagesSquare}
            />
            <StatCard value={1000} label="Community Members" icon={Users} />
            <StatCard value={5000} label="Hours Saved" icon={Clock} />
            <StatCard value={10000} label="AI Responses" icon={Brain} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white/50 to-blue-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features for Community Management
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Streamline your workflow with AI-powered tools designed for modern
              community engagement
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Knowledge Bot"
              description="AI-powered bot that understands and responds to community queries instantly"
              icon={Bot}
              gradient="bg-gradient-to-r from-blue-500/10 to-green-500/10"
            />
            <FeatureCard
              title="Member Matching"
              description="Intelligent system for connecting community members based on skills and interests"
              icon={Users}
              gradient="bg-gradient-to-r from-green-500/10 to-blue-500/10"
            />
            <FeatureCard
              title="Twitter Management"
              description="Streamlined content creation and management for your Twitter presence"
              icon={Twitter}
              gradient="bg-gradient-to-r from-blue-500/10 to-green-500/10"
            />
            <FeatureCard
              title="Local LLM Security"
              description="Enhanced privacy with local language model deployment"
              icon={Shield}
              gradient="bg-gradient-to-r from-green-500/10 to-blue-500/10"
            />
            <FeatureCard
              title="Data Analytics"
              description="Comprehensive insights into community engagement and activity"
              icon={Database}
              gradient="bg-gradient-to-r from-blue-500/10 to-green-500/10"
            />
            <FeatureCard
              title="Smart Automation"
              description="Automated workflows for routine community management tasks"
              icon={Sparkles}
              gradient="bg-gradient-to-r from-green-500/10 to-blue-500/10"
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white/50" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simple steps to transform your community management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Upload Knowledge Base"
              description="Import your community guidelines, FAQs, and documentation"
              icon={Upload}
            />
            <StepCard
              number="2"
              title="Configure Integrations"
              description="Connect your Telegram and Twitter accounts seamlessly"
              icon={Code}
            />
            <StepCard
              number="3"
              title="Go Live"
              description="Launch your AI-powered community management system"
              icon={CheckCircle}
            />
          </div>
        </div>
      </section>

      {/* Integration Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white/50 to-blue-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Platform Integrations
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Seamlessly connected with your favorite platforms
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <IntegrationCard
              platform="Telegram"
              icon={Twitter}
              metrics={[
                { value: "24/7", label: "Availability" },
                { value: "< 1s", label: "Response Time" },
                { value: "99.9%", label: "Accuracy" },
                { value: "50k+", label: "Messages" },
              ]}
            />
            <IntegrationCard
              platform="Twitter"
              icon={Twitter}
              metrics={[
                { value: "100+", label: "Daily Posts" },
                { value: "5k+", label: "Engagements" },
                { value: "98%", label: "Auto-Moderation" },
                { value: "2x", label: "Reach Growth" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Privacy Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-600"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">Secure Local Deployment</h2>
            <p className="text-blue-100">
              Your data never leaves your infrastructure
            </p>
          </div>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            Learn More About Security
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
