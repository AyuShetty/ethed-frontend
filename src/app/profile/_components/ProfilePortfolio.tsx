"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Trophy,
  Zap,
  Users,
  GitBranch,
  Star,
  Target,
  PawPrint,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  handle: string;
}

// Mock data - replace with real data later
const mockProfile = {
  ens: "dhanush.eth",
  displayName: "Dhanush Kumar",
  bio: "Building the future of decentralized education. Smart contracts enthusiast. Learning never stops.",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dhanush",
  location: "Singapore",
  website: "https://dhanush.dev",
  joinedDate: "2024-01-15",
  followers: 847,
  following: 293,
  verified: true,
  streak: 47,
  totalXP: 12580,
  coursesCompleted: 28,
  nftsEarned: 34,
};

const mockNFTs = [
  { id: 1, name: "Solidity Master", description: "Completed Advanced Smart Contracts", image: "https://api.dicebear.com/7.x/shapes/svg?seed=solidity", rarity: "Epic", earned: "2024-03-15" },
  { id: 2, name: "DeFi Explorer", description: "Mastered DeFi protocols and yield farming", image: "https://api.dicebear.com/7.x/shapes/svg?seed=defi", rarity: "Rare", earned: "2024-03-10" },
  { id: 3, name: "Web3 Pioneer", description: "First 100 learners on EthEd", image: "https://api.dicebear.com/7.x/shapes/svg?seed=pioneer", rarity: "Legendary", earned: "2024-01-20" },
  { id: 4, name: "Gas Optimizer", description: "Reduced contract gas by 40%", image: "https://api.dicebear.com/7.x/shapes/svg?seed=gas", rarity: "Epic", earned: "2024-02-28" },
  { id: 5, name: "Streak Champion", description: "30-day learning streak", image: "https://api.dicebear.com/7.x/shapes/svg?seed=streak", rarity: "Rare", earned: "2024-03-05" },
  { id: 6, name: "Community Helper", description: "Helped 50+ learners", image: "https://api.dicebear.com/7.x/shapes/svg?seed=helper", rarity: "Common", earned: "2024-02-15" },
];

const mockCourses = [
  { id: 1, title: "Advanced Smart Contracts", progress: 100, totalLessons: 24, completedAt: "2024-03-15", difficulty: "Advanced" },
  { id: 2, title: "DeFi Development", progress: 85, totalLessons: 18, completedAt: null, difficulty: "Intermediate" },
  { id: 3, title: "NFT Marketplace", progress: 100, totalLessons: 16, completedAt: "2024-02-28", difficulty: "Intermediate" },
  { id: 4, title: "Web3 Security", progress: 60, totalLessons: 20, completedAt: null, difficulty: "Advanced" },
];

const mockActivity = [
  { type: "nft", title: "Earned 'Solidity Master' NFT", date: "2024-03-15", icon: <Award className="w-4 h-4" /> },
  { type: "course", title: "Completed 'Advanced Smart Contracts'", date: "2024-03-15", icon: <BookOpen className="w-4 h-4" /> },
  { type: "streak", title: "Achieved 45-day learning streak", date: "2024-03-12", icon: <Zap className="w-4 h-4" /> },
  { type: "social", title: "Helped @alice.eth with deployment", date: "2024-03-10", icon: <Users className="w-4 h-4" /> },
  { type: "nft", title: "Earned 'DeFi Explorer' NFT", date: "2024-03-10", icon: <Award className="w-4 h-4" /> },
];

const rarityColors = {
  Common: "text-gray-400 border-gray-400/30",
  Rare: "text-blue-400 border-blue-400/30",
  Epic: "text-purple-400 border-purple-400/30",
  Legendary: "text-yellow-400 border-yellow-400/30",
};

export default function ProfilePortfolio({ handle }: Props) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const copyProfile = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/profile/${handle}`);
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* EthEd radial/glow background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-300/15 via-background to-background" />
        <div className="absolute top-10 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="w-24 h-24 mb-4 ring-2 ring-emerald-400/30">
                    <AvatarImage src={mockProfile.avatar} alt={mockProfile.displayName} />
                    <AvatarFallback className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900">
                      {mockProfile.displayName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-400/30 text-emerald-300"
                      onClick={copyProfile}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Share"}
                    </Button>
                    <Button variant="outline" size="sm" className="border-cyan-400/30 text-cyan-300">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      ENS
                    </Button>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                      {mockProfile.displayName}
                    </h1>
                    {mockProfile.verified && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                        <Globe className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg text-white font-medium">{mockProfile.ens}</span>
                    <Badge variant="outline" className="text-purple-300 border-purple-400/30">
                      ENS
                    </Badge>
                  </div>
                  <p className="text-slate-300 mb-4 max-w-2xl">{mockProfile.bio}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(mockProfile.joinedDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {mockProfile.followers} followers • {mockProfile.following} following
                    </span>
                    {mockProfile.website && (
                      <a href={mockProfile.website} className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
                        <ExternalLink className="w-4 h-4" />
                        {mockProfile.website.replace('https://', '')}
                      </a>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:w-48">
                  <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                    <div className="text-2xl font-bold text-emerald-300">{mockProfile.streak}</div>
                    <div className="text-xs text-slate-400">Day Streak</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                    <div className="text-2xl font-bold text-cyan-300">{mockProfile.totalXP.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">Total XP</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-400/20">
                    <div className="text-2xl font-bold text-purple-300">{mockProfile.coursesCompleted}</div>
                    <div className="text-xs text-slate-400">Courses</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/20">
                    <div className="text-2xl font-bold text-yellow-300">{mockProfile.nftsEarned}</div>
                    <div className="text-xs text-slate-400">NFTs</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/40 backdrop-blur-xl border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              Overview
            </TabsTrigger>
            <TabsTrigger value="nfts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              NFT Collection
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              Learning Path
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent NFTs */}
              <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Award className="w-5 h-5 text-emerald-400" />
                    Recent NFTs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockNFTs.slice(0, 3).map((nft) => (
                    <div key={nft.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30 border border-white/10">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">{nft.name}</div>
                        <div className="text-xs text-slate-400">{nft.earned}</div>
                      </div>
                      <Badge variant="outline" className={rarityColors[nft.rarity as keyof typeof rarityColors]}>
                        {nft.rarity}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5 text-cyan-400" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300 truncate">{course.title}</span>
                        <span className="text-xs text-slate-400">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Buddy Stats */}
              <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <PawPrint className="w-5 h-5 text-purple-400" />
                    AI Buddy Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Buddy Level</span>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                      Level 7
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Sessions</span>
                    <span className="text-white font-medium">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Hints Used</span>
                    <span className="text-white font-medium">67</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Success Rate</span>
                    <span className="text-emerald-300 font-medium">94%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NFTs Tab */}
          <TabsContent value="nfts" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {mockNFTs.map((nft) => (
                <Card key={nft.id} className="bg-slate-800/40 backdrop-blur-xl border border-white/10 hover:border-emerald-400/30 transition-colors group">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-purple-400/20 mb-4 flex items-center justify-center group-hover:from-emerald-400/30 group-hover:via-cyan-400/30 group-hover:to-purple-400/30 transition-colors">
                      <Award className="w-12 h-12 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white truncate">{nft.name}</h3>
                        <Badge variant="outline" className={rarityColors[nft.rarity as keyof typeof rarityColors]}>
                          {nft.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{nft.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Earned: {nft.earned}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {mockCourses.map((course) => (
                <Card key={course.id} className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{course.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                              {course.difficulty}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {course.progress === 100 ? `Completed ${course.completedAt}` : `${Math.round((course.progress / 100) * course.totalLessons)}/${course.totalLessons} lessons`}
                            </span>
                          </div>
                        </div>
                      </div>
                      {course.progress === 100 && <Trophy className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Progress</span>
                        <span className="text-white font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {mockActivity.map((activity, index) => (
                <Card key={index} className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.title}</p>
                        <p className="text-xs text-slate-400">{activity.date}</p>
                      </div>
                      <Badge variant="outline" className="text-slate-300 border-slate-400/30 capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}