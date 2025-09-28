"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BookOpen,
  Award,
  Users,
  Zap,
  Heart,
  Globe,
  Gift,
  Crown,
  Star,
  Brain,
  Target,
  TrendingUp,
  Wallet,
  PawPrint,
  MessageCircle,
  Code,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
  details: string[];
  demo?: React.ReactNode;
}

interface Feature {
  title: string;
  description: string;
  icon: any;
  color: string;
  benefits: string[];
}

const learningSteps: Step[] = [
  {
    id: 1,
    title: "Sign Up & Choose Your Buddy",
    description: "Create your account and select a learning companion to guide your journey",
    icon: PawPrint,
    color: "emerald",
    details: [
      "Connect with Web3 wallet or social login",
      "Choose from 4 unique learning buddies",
      "Each buddy has different personalities and specialties",
      "Your buddy grows and evolves with you"
    ]
  },
  {
    id: 2,
    title: "Claim Your ENS Identity",
    description: "Get your unique EthEd subdomain for your blockchain identity",
    icon: Globe,
    color: "cyan",
    details: [
      "Receive a free yourname.ethed.eth subdomain",
      "Use it across the entire Web3 ecosystem",
      "Build your decentralized reputation",
      "Own your digital identity forever"
    ]
  },
  {
    id: 3,
    title: "Learn Through Interactive Courses",
    description: "Engage with hands-on lessons designed for Web3 developers",
    icon: BookOpen,
    color: "purple",
    details: [
      "Interactive coding challenges and quizzes",
      "Real-world project-based learning",
      "AI-powered personalized learning paths",
      "Community discussions and peer learning"
    ]
  },
  {
    id: 4,
    title: "Earn NFT Credentials",
    description: "Collect verifiable achievements and build your Web3 portfolio",
    icon: Award,
    color: "yellow",
    details: [
      "NFT certificates for completed courses",
      "Skill badges for specific competencies",
      "Achievement tokens for milestones",
      "Tradeable and verifiable credentials"
    ]
  }
];

const keyFeatures: Feature[] = [
  {
    title: "AI Learning Companion",
    description: "Your personal buddy adapts to your learning style and provides motivation",
    icon: Heart,
    color: "pink",
    benefits: [
      "Personalized learning recommendations",
      "24/7 availability for questions and support",
      "Emotional intelligence to keep you motivated",
      "Gamified progression system"
    ]
  },
  {
    title: "Blockchain Integration",
    description: "True ownership of your achievements and progress on-chain",
    icon: Wallet,
    color: "blue",
    benefits: [
      "Immutable learning records",
      "Portable credentials across platforms", 
      "Decentralized identity ownership",
      "Smart contract verified skills"
    ]
  },
  {
    title: "Community Learning",
    description: "Connect with fellow learners and industry experts worldwide",
    icon: Users,
    color: "green",
    benefits: [
      "Peer-to-peer knowledge sharing",
      "Expert-led workshops and AMAs",
      "Collaborative project opportunities",
      "Global developer network access"
    ]
  },
  {
    title: "Real-World Projects", 
    description: "Build actual DApps and smart contracts while learning",
    icon: Code,
    color: "orange",
    benefits: [
      "Hands-on coding experience",
      "Deploy to live testnets",
      "Build portfolio-worthy projects",
      "Industry-relevant skill development"
    ]
  }
];

const buddyOptions = [
  {
    id: "spark",
    name: "Spark",
    emoji: "🐉",
    personality: "Wise Mentor",
    specialty: "Advanced concepts and deep understanding",
    color: "from-yellow-400 to-orange-500"
  },
  {
    id: "cypher",
    name: "Cypher", 
    emoji: "🦊",
    personality: "Tech Genius",
    specialty: "Coding challenges and technical skills",
    color: "from-purple-400 to-pink-500"
  },
  {
    id: "hoot",
    name: "Professor Hoot",
    emoji: "🦉", 
    personality: "Academic Scholar",
    specialty: "Theory and comprehensive learning",
    color: "from-blue-400 to-cyan-500"
  },
  {
    id: "luna",
    name: "Luna",
    emoji: "🐱",
    personality: "Creative Explorer", 
    specialty: "Creative projects and innovation",
    color: "from-green-400 to-emerald-500"
  }
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState(buddyOptions[0]);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const currentStep = learningSteps.find(step => step.id === activeStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-300/15 via-background to-background" />
        <div className="absolute top-20 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Learn. Build. Own.</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
          >
            How EthEd Works
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Discover how EthEd revolutionizes Web3 education with AI companions, 
            blockchain credentials, and hands-on learning experiences.
          </motion.p>
        </div>

        {/* Interactive Learning Flow */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Learning Journey
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Follow these steps to transform from Web3 curious to blockchain builder
            </p>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-4 p-2 bg-slate-800/40 rounded-2xl border border-white/10 backdrop-blur-xl">
              {learningSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                      activeStep === step.id
                        ? `bg-${step.color}-500/20 border border-${step.color}-400/40 text-${step.color}-300`
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">{step.title}</span>
                    <span className="font-medium sm:hidden">Step {step.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Content */}
          <AnimatePresence mode="wait">
            {currentStep && (
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                {/* Step Details */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-${currentStep.color}-500/20 border border-${currentStep.color}-400/40`}>
                      <currentStep.icon className={`w-6 h-6 text-${currentStep.color}-300`} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Step {currentStep.id}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {currentStep.title}
                  </h3>
                  
                  <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                    {currentStep.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {currentStep.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 text-${currentStep.color}-400 mt-0.5 flex-shrink-0`} />
                        <span className="text-slate-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interactive Demo */}
                <div className="relative">
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 overflow-hidden">
                    <CardContent className="p-0">
                      {/* Demo content based on current step */}
                      {activeStep === 1 && (
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-white mb-4">Choose Your Learning Buddy</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {buddyOptions.map((buddy) => (
                              <motion.div
                                key={buddy.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedBuddy(buddy)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                  selectedBuddy.id === buddy.id
                                    ? "border-emerald-400 bg-emerald-500/10"
                                    : "border-slate-600 hover:border-slate-500"
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-2xl mb-2">{buddy.emoji}</div>
                                  <h5 className="font-medium text-white text-sm">{buddy.name}</h5>
                                  <p className="text-xs text-slate-400">{buddy.personality}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg border border-emerald-500/20">
                            <p className="text-emerald-300 text-sm">
                              <span className="text-xl mr-2">{selectedBuddy.emoji}</span>
                              {selectedBuddy.specialty}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeStep === 2 && (
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-white mb-4">Your ENS Identity</h4>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="yourname"
                                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm"
                                defaultValue="alex-dev"
                              />
                              <span className="text-slate-400 font-mono">.ethed.eth</span>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Globe className="w-6 h-6 text-cyan-400" />
                                <div>
                                  <p className="text-cyan-300 font-medium">alex-dev.ethed.eth</p>
                                  <p className="text-slate-400 text-sm">Your Web3 identity across all platforms</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeStep === 3 && (
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-white mb-4">Interactive Learning</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                              <span className="text-white font-medium">Smart Contract Basics</span>
                              <Badge className="bg-emerald-500/20 text-emerald-300">In Progress</Badge>
                            </div>
                            <Progress value={65} className="h-2" />
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                                <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                                <p className="text-purple-300 text-sm font-medium">5 Lessons</p>
                              </div>
                              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                                <Code className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                                <p className="text-yellow-300 text-sm font-medium">3 Projects</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeStep === 4 && (
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-white mb-4">NFT Achievements</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 text-center">
                              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                              <h5 className="text-white font-medium text-sm">Smart Contract Master</h5>
                              <Badge variant="outline" className="text-xs mt-1">Legendary</Badge>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-500/30 text-center">
                              <Star className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                              <h5 className="text-white font-medium text-sm">DApp Developer</h5>
                              <Badge variant="outline" className="text-xs mt-1">Epic</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Navigation Arrows */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Previous
            </Button>
            <Button
              onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
              disabled={activeStep === 4}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.section>

        {/* Key Features */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why EthEd is Different
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Revolutionary features that make Web3 learning engaging, verifiable, and rewarding
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isExpanded = expandedFeature === index;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 h-full hover:border-white/20 transition-all duration-300 group cursor-pointer">
                    <CardHeader 
                      className="pb-4"
                      onClick={() => setExpandedFeature(isExpanded ? null : index)}
                    >
                      <div className={`p-3 rounded-xl bg-${feature.color}-500/20 border border-${feature.color}-400/40 w-fit group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 text-${feature.color}-300`} />
                      </div>
                      <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
                        {feature.title}
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </CardTitle>
                      <p className="text-slate-300 text-sm">
                        {feature.description}
                      </p>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="pt-0">
                            <ul className="space-y-2">
                              {feature.benefits.map((benefit, benefitIndex) => (
                                <li key={benefitIndex} className="flex items-start gap-2">
                                  <CheckCircle className={`w-4 h-4 text-${feature.color}-400 mt-0.5 flex-shrink-0`} />
                                  <span className="text-slate-300 text-sm">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Learning Path Preview */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Structured Learning Paths
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Progress from beginner to expert with our carefully crafted curriculum
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                level: "Beginner",
                title: "Web3 Fundamentals",
                duration: "4-6 weeks",
                courses: 5,
                color: "emerald",
                topics: ["Blockchain Basics", "Crypto Wallets", "Smart Contracts Intro", "DeFi Concepts", "NFT Fundamentals"]
              },
              {
                level: "Intermediate", 
                title: "Smart Contract Development",
                duration: "8-10 weeks",
                courses: 8,
                color: "cyan",
                topics: ["Solidity Programming", "Contract Testing", "Security Best Practices", "DApp Frontend", "IPFS Integration"]
              },
              {
                level: "Advanced",
                title: "DeFi & Protocol Building",
                duration: "12-16 weeks", 
                courses: 12,
                color: "purple",
                topics: ["Advanced DeFi", "Protocol Design", "MEV & Arbitrage", "Cross-chain", "Governance Systems"]
              }
            ].map((path, index) => (
              <Card key={index} className="bg-slate-800/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`bg-${path.color}-500/20 text-${path.color}-300`}>
                      {path.level}
                    </Badge>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">{path.duration}</p>
                      <p className="text-slate-300 text-sm font-medium">{path.courses} courses</p>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                    {path.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {path.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${path.color}-400`} />
                        <span className="text-slate-300 text-sm">{topic}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    View Curriculum
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-400/20 backdrop-blur-xl">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Start Your Web3 Journey?
                </h2>
                <p className="text-slate-300 text-lg mb-8">
                  Join thousands of developers already learning and building on EthEd. 
                  Get your AI buddy, claim your ENS identity, and start earning NFT credentials today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                    <Link href="/onboarding">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    <Link href="/courses">
                      Explore Courses
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-8 mt-8 text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm">Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm">Own your credentials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm">AI-powered learning</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}