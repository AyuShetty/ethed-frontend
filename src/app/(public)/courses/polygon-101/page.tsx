'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, FileText, Code, CheckCircle, Clock, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'motion/react';

const courseModules = [
  { id: 1, title: 'Agentic Payments 101', type: 'video', duration: '12 min', description: 'Introduction to AI agents making payments autonomously' },
  { id: 2, title: 'The x402 Flow by Example', type: 'text', duration: '15 min', description: 'Understanding the 4-step payment challenge process' },
  { id: 3, title: 'AP2 and x402 Together', type: 'text', duration: '18 min', description: 'How traditional and crypto payments work together' },
  { id: 4, title: 'Polygon Specifics for ETHGlobal', type: 'text', duration: '14 min', description: 'Meeting bounty requirements and using Polygon Amoy' },
  { id: 5, title: 'Essential Terms with Examples', type: 'text', duration: '16 min', description: 'Key concepts explained in simple, friendly terms' },
  { id: 6, title: 'Architecture You Will Build', type: 'text', duration: '20 min', description: 'Components and data flow for your agentic payment system' },
  { id: 7, title: 'Hands-on Labs', type: 'code', duration: '45 min', description: '5 practical labs to build your first x402 integration' },
  { id: 8, title: 'Security & Best Practices', type: 'text', duration: '22 min', description: 'Safety, compliance, and what to avoid building' },
  { id: 9, title: 'Real-World Use Cases', type: 'text', duration: '18 min', description: 'Inspiring examples to guide your project ideas' },
  { id: 10, title: 'Capstone & Submission', type: 'text', duration: '25 min', description: 'Building your final project and preparing for judges' }
];

export default function PolygonCoursePage() {
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('polygon-101-completed');
    if (saved) {
      setCompletedModules(new Set(JSON.parse(saved)));
    }
  }, []);

  const completionPercentage = (completedModules.size / courseModules.length) * 100;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Course Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="h-4 w-4" />
            ETHGlobal Prize Track
          </div>
          
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Polygon 101: Agentic Payments
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Learn how AI agents can make payments autonomously using x402 protocol on Polygon. 
            Build the future where value moves as seamlessly as data over the internet! 🚀
          </p>

          <div className="flex items-center justify-center gap-8 text-slate-400 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>4-5 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Beginner Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span>x402 Expert NFT</span>
            </div>
          </div>

          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg rounded-lg">
            <Link href="/courses/polygon-101/lesson/1" className="flex items-center gap-2">
              Start Learning
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-400" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-300">
                  Completed: <span className="text-purple-300">{completedModules.size}/{courseModules.length}</span>
                </span>
                <span className="text-slate-300">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Modules */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8">Course Modules</h2>
          
          <div className="grid gap-6">
            {courseModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                          {module.id}
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">{module.title}</CardTitle>
                          <CardDescription className="text-slate-400 mt-1">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${
                          module.type === 'video' ? 'border-purple-400/40 text-purple-300' :
                          module.type === 'code' ? 'border-green-400/40 text-green-300' :
                          'border-blue-400/40 text-blue-300'
                        }`}>
                          {module.type === 'video' && <Play className="inline h-3 w-3 mr-1" />}
                          {module.type === 'code' && <Code className="inline h-3 w-3 mr-1" />}
                          {module.type === 'text' && <FileText className="inline h-3 w-3 mr-1" />}
                          {module.type.charAt(0).toUpperCase() + module.type.slice(1)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>{module.duration}</span>
                        </div>
                        
                        {completedModules.has(module.id) && (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Link href={`/courses/polygon-101/lesson/${module.id}`}>
                      <Button 
                        variant="outline" 
                        className="w-full border-purple-400/40 text-purple-300 hover:bg-purple-400/10 hover:border-purple-400"
                      >
                        {completedModules.has(module.id) ? 'Review Module' : 'Start Module'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Course Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What You&apos;ll Build</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border-purple-400/20">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Code className="h-6 w-6" />
                  x402 Payment API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Build an API that challenges clients with payment requirements and verifies crypto payments on Polygon Amoy.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-900/50 to-slate-900/50 border-pink-400/20">
              <CardHeader>
                <CardTitle className="text-pink-300 flex items-center gap-2">
                  <Play className="h-6 w-6" />
                  Autonomous Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Create an AI agent that automatically pays for services and retries API calls with signed crypto payments.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center gap-2">
                  <Award className="h-6 w-6" />
                  ETHGlobal Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Deploy on Polygon Amoy with complete documentation to qualify for ETHGlobal bounty prizes.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}