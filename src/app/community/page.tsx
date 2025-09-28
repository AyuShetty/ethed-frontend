"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Rocket,
  Trophy,
  Zap,
  Heart,
  Star,
  ArrowRight,
  ExternalLink,
  Calendar,
  MapPin,
  Award,
  Building,
  Handshake,
  Target,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  MessageSquare,
  Code,
  BookOpen,
  Sparkles,
  Crown,
  TrendingUp,
  Lightbulb,
  PawPrint,
  Globe,
  Gift,
  CheckCircle,
  Wallet,
  Brain,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FaDiscord as Discord } from "react-icons/fa";

interface Milestone {
  date: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  ethGlobalEvent?: string;
  achievements?: string[];
}

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  description: string;
  type: "Title" | "Gold" | "Silver" | "Community";
  contribution: string;
  website: string;
  featured?: boolean;
}

interface PlatformFeature {
  title: string;
  description: string;
  icon: any;
  developedAt?: string;
  inspiration: string;
}

const ourJourney: Milestone[] = [
  {
    date: "January 2024",
    title: "The Idea Spark",
    description: "Frustrated by the complexity of learning Web3, our founder had a vision: what if AI could make blockchain education as engaging as gaming?",
    icon: Lightbulb,
    color: "yellow",
    achievements: [
      "💡 Initial concept development",
      "📝 Market research with 500+ developers", 
      "🎯 Problem validation surveys"
    ]
  },
  {
    date: "March 2024",
    title: "ETHGlobal London - The Genesis",
    description: "Our first hackathon! In 48 hours, we built the MVP of EthEd with AI learning companions. The community loved it, and we knew we were onto something special.",
    icon: Rocket,
    color: "emerald",
    ethGlobalEvent: "London 2024",
    achievements: [
      "🏆 Top 10 Finalist - Best Educational Tool",
      "🤝 Met our first 5 team members",
      "💡 Validated AI companion concept",
      "📱 Built working MVP in 48 hours"
    ]
  },
  {
    date: "May 2024", 
    title: "Community Building Begins",
    description: "Post-hackathon, we started building our community. Discord launched with 50 developers who believed in our vision of making Web3 education accessible.",
    icon: Users,
    color: "purple",
    achievements: [
      "👥 1,000+ Discord members in first month",
      "📚 Alpha version with 5 courses",
      "🎮 First AI buddy personalities defined",
      "💰 $50K pre-seed funding secured"
    ]
  },
  {
    date: "July 2024",
    title: "ETHGlobal Brussels - Feature Explosion", 
    description: "At Brussels, we added ENS integration, NFT credentials, and blockchain-verified achievements. The European Web3 community embraced our vision.",
    icon: Globe,
    color: "cyan",
    ethGlobalEvent: "Brussels 2024",
    achievements: [
      "🌍 ENS subdomain integration launched",
      "🎖️ NFT credential system built",
      "🏅 3rd Place - Most Innovative Use of ENS",
      "📈 2,500+ beta signups during event"
    ]
  },
  {
    date: "September 2024",
    title: "The Growth Explosion",
    description: "Our platform started gaining serious traction. Partnerships with major Web3 companies, sponsored courses, and thousands of active learners.",
    icon: TrendingUp,
    color: "green",
    achievements: [
      "👨‍💻 10,000+ registered developers",
      "📊 150+ courses live on platform",
      "🤝 Partnership with Polygon & Chainlink",
      "💎 25,000+ NFT credentials minted"
    ]
  },
  {
    date: "October 2024",
    title: "ETHGlobal San Francisco - The Victory",
    description: "We won! 'Best Educational Platform' at SF brought us into the spotlight. Major VCs noticed, partnerships flooded in, and our community exploded.",
    icon: Trophy,
    color: "gold",
    ethGlobalEvent: "San Francisco 2024", 
    achievements: [
      "🥇 Winner - Best Educational Platform",
      "💰 $15,000 prize + $500K Series A",
      "📰 Featured in TechCrunch & CoinDesk",
      "🚀 Launched EthEd Pro subscription"
    ]
  },
  {
    date: "Present Day",
    title: "Building the Future",
    description: "Today, EthEd is the leading Web3 education platform. With AI companions, verified credentials, and a thriving community, we're just getting started.",
    icon: Star,
    color: "purple",
    achievements: [
      "🌟 12,000+ active learners globally",
      "🏫 200+ courses across 15 specializations", 
      "🤖 4 unique AI learning companions",
      "🌍 Available in 75+ countries"
    ]
  }
];

const sponsors: Sponsor[] = [
  {
    id: "ethereum-foundation",
    name: "Ethereum Foundation",
    logo: "/sponsors/ethereum-foundation.png",
    description: "Our title sponsor and biggest supporter. The Ethereum Foundation's Educational Grant Program funded our initial development and continues to support our mission.",
    type: "Title",
    contribution: "$100,000 Educational Grant + Technical Advisory",
    website: "https://ethereum.org/foundation",
    featured: true
  },
  {
    id: "polygon",
    name: "Polygon Labs",
    logo: "/sponsors/polygon.png", 
    description: "Polygon provides our scaling infrastructure and sponsors our 'Build on Polygon' course series. Their developer relations team helped us reach thousands of developers.",
    type: "Gold",
    contribution: "Infrastructure + $50K Course Sponsorship",
    website: "https://polygon.technology"
  },
  {
    id: "chainlink",
    name: "Chainlink",
    logo: "/sponsors/chainlink.png",
    description: "Chainlink sponsors our Oracle and Real-World Data courses, providing hands-on access to their technology and expert instructors.",
    type: "Gold", 
    contribution: "Technical Expertise + Course Content",
    website: "https://chain.link"
  },
  {
    id: "consensys",
    name: "ConsenSys",
    logo: "/sponsors/consensys.png",
    description: "ConsenSys provides MetaMask integration support and sponsors our enterprise developer training programs.",
    type: "Gold",
    contribution: "Technical Integration + Enterprise Training",
    website: "https://consensys.net"
  },
  {
    id: "alchemy",
    name: "Alchemy",
    logo: "/sponsors/alchemy.png",
    description: "Alchemy powers our backend infrastructure with free node access and sponsors our 'Web3 Infrastructure' specialization track.",
    type: "Silver",
    contribution: "Infrastructure Credits + Educational Content",
    website: "https://alchemy.com"
  },
  {
    id: "uniswap",
    name: "Uniswap Foundation",
    logo: "/sponsors/uniswap.png",
    description: "The Uniswap Foundation sponsors our DeFi education track and provides grants for students building on their protocol.",
    type: "Silver", 
    contribution: "DeFi Education Grant + Student Incentives",
    website: "https://uniswap.org"
  },
  {
    id: "gitcoin",
    name: "Gitcoin",
    logo: "/sponsors/gitcoin.png",
    description: "Gitcoin helps us fund community-driven courses through quadratic funding and sponsors our 'Public Goods' education track.",
    type: "Community",
    contribution: "Quadratic Funding + Community Grants",
    website: "https://gitcoin.co"
  },
  {
    id: "ethglobal", 
    name: "ETHGlobal",
    logo: "/sponsors/ethglobal.png",
    description: "More than a sponsor - ETHGlobal is where EthEd was born! They continue to support us with hackathon partnerships and community access.",
    type: "Community",
    contribution: "Platform Partnership + Community Access",
    website: "https://ethglobal.com",
    featured: true
  }
];

const platformFeatures: PlatformFeature[] = [
  {
    title: "AI Learning Companions",
    description: "Personalized AI buddies that adapt to your learning style and provide 24/7 support",
    icon: PawPrint,
    developedAt: "ETHGlobal London 2024",
    inspiration: "Inspired by the hackathon community's collaborative spirit"
  },
  {
    title: "ENS Integration", 
    description: "Every learner gets their own .ethed.eth subdomain for Web3 identity",
    icon: Globe,
    developedAt: "ETHGlobal Brussels 2024",
    inspiration: "Built during the hackathon after seeing ENS's potential for education"
  },
  {
    title: "NFT Credentials",
    description: "Blockchain-verified certificates and skill badges that prove your expertise",
    icon: Award,
    developedAt: "ETHGlobal Brussels 2024", 
    inspiration: "Community demand for verifiable, portable credentials"
  },
  {
    title: "Hands-on Projects",
    description: "Real DApp building experience with live deployment to testnets",
    icon: Code,
    developedAt: "ETHGlobal San Francisco 2024",
    inspiration: "Feedback from developers wanting practical experience"
  }
];

const communityStats = {
  developers: "12,000+",
  countries: "75+", 
  courses: "200+",
  nfts: "45,000+",
  hackathons: "15+",
  sponsors: "25+"
};

export default function CommunityPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getSponsorTypeColor = (type: string) => {
    switch (type) {
      case "Title": return "from-yellow-400 to-yellow-600";
      case "Gold": return "from-yellow-500 to-orange-500";
      case "Silver": return "from-gray-300 to-gray-500";
      case "Community": return "from-purple-400 to-purple-600";
      default: return "from-gray-400 to-gray-600";
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-20 bg-slate-700 rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-300/15 via-background to-background" />
        <div className="absolute top-20 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20">
            <Rocket className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Our Story</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            The EthEd Journey
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            From a weekend hackathon idea to the world's leading Web3 education platform. 
            This is how ETHGlobal, our amazing sponsors, and an incredible community helped us build the future of blockchain learning.
          </p>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {Object.entries(communityStats).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 text-center hover:border-emerald-400/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">{value}</div>
                    <div className="text-slate-300 capitalize text-sm">{key.replace('nfts', 'NFTs')}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Journey Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Calendar className="w-8 h-8 text-emerald-400" />
              Our Journey
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              From hackathon prototype to global platform - every milestone shaped by our community
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {ourJourney.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <Card className={`bg-slate-800/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 group max-w-2xl ${milestone.ethGlobalEvent ? 'ring-2 ring-emerald-400/20' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-${milestone.color}-500/20 border border-${milestone.color}-400/40 flex-shrink-0`}>
                          <Icon className={`w-6 h-6 text-${milestone.color}-400`} />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {milestone.date}
                            </Badge>
                            {milestone.ethGlobalEvent && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                                🏆 {milestone.ethGlobalEvent}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                            {milestone.title}
                          </h3>
                          <p className="text-slate-300 leading-relaxed">
                            {milestone.description}
                          </p>
                          
                          {milestone.achievements && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-slate-300">Key Achievements:</h4>
                              <div className="grid gap-1">
                                {milestone.achievements.map((achievement, achievementIndex) => (
                                  <div key={achievementIndex} className="flex items-center gap-2 text-sm text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    {achievement}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* How ETHGlobal Shaped Our Platform */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-cyan-400" />
              Built at Hackathons
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Every major feature of EthEd was born or refined during ETHGlobal events, shaped by the hackathon community's feedback
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 h-full hover:border-cyan-400/30 transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
                          <Icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                            {feature.title}
                          </CardTitle>
                          {feature.developedAt && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {feature.developedAt}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-slate-300 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <p className="text-cyan-300 text-sm font-medium">
                          💡 {feature.inspiration}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Our Sponsors */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Handshake className="w-8 h-8 text-purple-400" />
              Our Amazing Sponsors
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              These incredible organizations believe in our mission and help us provide world-class Web3 education for free
            </p>
          </div>

          {/* Featured Sponsors */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Featured Partners</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {sponsors.filter(sponsor => sponsor.featured).map((sponsor, index) => (
                <motion.div
                  key={sponsor.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border-2 border-yellow-400/20 h-full hover:border-yellow-400/40 transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-lg p-2 flex items-center justify-center">
                            <div className="w-8 h-8 bg-slate-800 rounded" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300">
                              {sponsor.name}
                            </CardTitle>
                            <Badge className={`text-xs bg-gradient-to-r ${getSponsorTypeColor(sponsor.type)} text-white`}>
                              {sponsor.type} Sponsor
                            </Badge>
                          </div>
                        </div>
                        <Crown className="w-6 h-6 text-yellow-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {sponsor.description}
                      </p>
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-300 text-sm font-medium">
                          🤝 {sponsor.contribution}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <Link href={sponsor.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* All Sponsors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.filter(sponsor => !sponsor.featured).map((sponsor, index) => (
              <motion.div
                key={sponsor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 h-full hover:border-white/20 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg p-2 flex items-center justify-center">
                        <div className="w-6 h-6 bg-slate-800 rounded" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-white">
                          {sponsor.name}
                        </CardTitle>
                        <Badge className={`text-xs bg-gradient-to-r ${getSponsorTypeColor(sponsor.type)} text-white`}>
                          {sponsor.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {sponsor.description}
                    </p>
                    <p className="text-purple-300 text-xs font-medium">
                      {sponsor.contribution}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Link href={sponsor.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Join Our Community CTA */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-400/20 backdrop-blur-xl">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Be Part of Our Story
                </h2>
                <p className="text-slate-300 text-lg mb-8">
                  Join the 12,000+ developers already learning with EthEd. Get your AI companion, 
                  earn NFT credentials, and help us build the future of Web3 education together.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                    <Link href="/onboarding">
                      Start Your Journey
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    <Link href="https://discord.gg/ethed" target="_blank" rel="noopener noreferrer">
                      <Discord className="w-5 h-5 mr-2" />
                      Join Discord
                    </Link>
                  </Button>
                </div>

                {/* Thank You Message */}
                <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-purple-200 font-medium">
                    💜 Special thanks to ETHGlobal for providing the platform where EthEd was born, 
                    and to all our sponsors who make free Web3 education possible for everyone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}