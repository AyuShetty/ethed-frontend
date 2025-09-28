'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Play, FileText, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';

const modules = [
  {
    id: 1,
    type: 'video',
    title: 'Agentic Payments 101',
    duration: '12 min',
    videoUrl: 'https://www.youtube.com/embed/bKJPlepMSL8',
    description: 'An AI or device should request a service and pay on its own, so value moves as seamlessly as data over the internet. See how Polygon enables this!',
  },
  {
    id: 2,
    type: 'text',
    title: 'The x402 Flow by Example',
    duration: '15 min',
    content: `# The x402 Flow by Example

Let’s break it down step by step, like a friendly toll booth for your agent:

1. **Agent calls API**: "Hey, can I get this data?"
2. **Server responds 402**: "Sure! It costs $0.10 in USDC. Here’s how to pay."
3. **Agent retries with payment**: The agent pays, then asks again.
4. **Server verifies and delivers**: Server checks the payment on Polygon, then sends the data.

**Analogy:** Like a toll booth that shows the price and coins it accepts. You pay, and the gate opens!

**Why Polygon?** Fast, cheap, and supported for agentic payments.`,
    description: 'See the 4-step payment challenge process in action, with simple analogies.',
  },
  {
    id: 3,
    type: 'text',
    title: 'AP2 and x402 Together',
    duration: '18 min',
    content: `# AP2 and x402 Together

**AP2** connects agents to traditional payment rails (cards, banks).
**x402** lets agents pay with crypto, like USDC on Polygon.

**Bridge:** AP2 and x402 work together—AP2 for cards, x402 for crypto. You get both worlds!

**Example:** A merchant can accept cards from humans and USDC from bots, all in one app.`,
    description: 'How traditional and crypto payments work together for agentic apps.',
  },
  {
    id: 4,
    type: 'text',
    title: 'Polygon Specifics for ETHGlobal',
    duration: '14 min',
    content: `# Polygon Specifics for ETHGlobal

**Why Polygon Amoy?** ETHGlobal prizes require agentic payments on Polygon Amoy. It’s fast, cheap, and easy for hackathons.

**Tip:** Build your demo on Amoy, price in USDC, and document everything for judges.`,
    description: 'How to meet bounty requirements and use Polygon Amoy for your project.',
  },
  {
    id: 5,
    type: 'text',
    title: 'Essential Terms with Examples',
    duration: '16 min',
    content: `# Essential Terms with Friendly Examples

- **Agent:** A program that makes decisions and pays. *Example: A travel bot books a hotel and pays the API in USDC.*
- **HTTP 402 challenge:** Server says "payment required" with price and info. *Example: "This endpoint costs $0.02 in USDC—pay here, then retry."*
- **Facilitator:** Service that helps with payments. *Example: A provider that bundles pay-per-use for APIs.*
- **Micropayment:** Tiny payments per request. *Example: Agent pays a few cents for weather data.*
- **Subscription vs. pay-per-use:** Subscriptions charge up front; x402 lets agents pay per call.`,
    description: 'Key concepts explained in simple, friendly terms with real-world analogies.',
  },
  {
    id: 6,
    type: 'text',
    title: 'Architecture You Will Build',
    duration: '20 min',
    content: `# Architecture You Will Build

**Components:**
- API that returns data
- x402 gateway that replies 402 with price/token
- Agent client that pays and retries
- Polygon Amoy RPC for on-chain verification

**Flow:** Request → 402 → Payment → Verify → Response

**Tip:** Log payment hash and request id for auditability.`,
    description: 'See the components and data flow for your agentic payment system.',
  },
  {
    id: 7,
    type: 'code',
    title: 'Hands-on Labs',
    duration: '45 min',
    code: `// Lab 1: Hello, 402
app.get('/api/data', (req, res) => {
  res.status(402).json({
    price: '0.10',
    asset: 'USDC',
    chainId: '80002' // Polygon Amoy
  });
});

// Lab 2: Verify on Polygon
// ...pseudo-code for verifying payment on chain...

// Lab 3: Pricing strategies
// ...flat price, tiered price, daily cap...

// Lab 4: Agent client
// ...agent reads 402, pays, retries, logs payment hash...

// Lab 5: Receipts and refunds
// ...emit receipt, handle refunds for failed fulfillment...`,
    description: '5 practical labs to build your first x402 integration, with code snippets and explanations.',
  },
  {
    id: 8,
    type: 'text',
    title: 'Security & Best Practices',
    duration: '22 min',
    content: `# Security, Compliance, and What Not to Build

- **Safety:** Match amount, asset, destination, and chain exactly.
- **Idempotency:** Use request id to avoid double-charges.
- **Compliance:** AP2 shows where KYC/AML fits for future work.
- **What not to build:** Start simple—one x402 path on Polygon Amoy, great docs, reliable loop.`,
    description: 'Safety, compliance, and what to avoid building for agentic payments.',
  },
  {
    id: 9,
    type: 'text',
    title: 'Real-World Use Cases',
    duration: '18 min',
    content: `# Real-World Use Cases

- **Research agent:** Pays per article, caches results.
- **Data marketplace:** Weather publisher gets paid per call by optimization agents.
- **IoT energy:** Drone pays charging dock, gets receipt for flight logs.
- **Agentic SaaS:** Models subscribe to premium tools via per-use charges.`,
    description: 'Inspiring examples to guide your project ideas and show real-world impact.',
  },
  {
    id: 10,
    type: 'text',
    title: 'Capstone & Submission',
    duration: '25 min',
    content: `# Capstone and Submission Pack

**Goal:** Ship a demo of x402-metered API on Polygon Amoy with agent client and dashboard.

**Docs:** Include architecture diagram, threat model, test plan, setup steps, and a short video. Reference Polygon prize requirements in your README.

**Stretch:** Mention AP2 alignment for future work.`,
    description: 'Build your final project and prepare for judges, with a checklist and friendly advice.',
  }
];

export interface PolygonLessonClientProps {
  lessonId: string;
}

export default function PolygonLessonClient({ lessonId }: PolygonLessonClientProps) {
  const moduleId = parseInt(lessonId);
  const currentModule = modules.find(m => m.id === moduleId);
  // No quiz state required for now; add when quizzes are added
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('polygon-101-completed');
    if (saved) {
      setCompletedModules(new Set(JSON.parse(saved)));
    }
  }, []);

  const markAsCompleted = () => {
    const newCompleted = new Set([...completedModules, moduleId]);
    setCompletedModules(newCompleted);
    localStorage.setItem('polygon-101-completed', JSON.stringify([...newCompleted]));
  };

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <Button onClick={() => window.location.href = '/courses/polygon-101'}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  // ...existing code for rendering video, text, code, navigation, etc...
  // You can copy the ENS/EIPs lesson rendering logic here for consistency.

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6 text-purple-400 hover:text-purple-300" 
          onClick={() => window.location.href = '/courses/polygon-101'}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Back to Course
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <Card className="mb-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white mb-4">{currentModule.title}</CardTitle>
              <div className="flex items-center gap-4 mb-4">
                <div className={`px-3 py-1 rounded-full border text-sm font-medium ${
                  currentModule.type === 'video' ? 'border-purple-400/40 text-purple-300' :
                  currentModule.type === 'code' ? 'border-green-400/40 text-green-300' :
                  'border-blue-400/40 text-blue-300'
                }`}>
                  {currentModule.type === 'video' && <Play className="inline h-3 w-3 mr-1" />}
                  {currentModule.type === 'code' && <Code className="inline h-3 w-3 mr-1" />}
                  {currentModule.type === 'text' && <FileText className="inline h-3 w-3 mr-1" />}
                  {currentModule.type.charAt(0).toUpperCase() + currentModule.type.slice(1)}
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{currentModule.duration}</span>
                </div>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">{currentModule.description}</p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Video Content */}
              {currentModule.type === 'video' && 'videoUrl' in currentModule && (
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl">
                  <iframe 
                    src={currentModule.videoUrl} 
                    title={currentModule.title} 
                    allowFullScreen 
                    className="w-full h-full"
                  />
                </div>
              )}
              {/* Text Content */}
              {currentModule.type === 'text' && 'content' in currentModule && currentModule.content && (
                <div className="space-y-6">
                  {currentModule.content.split('\n').map((line: string, i: number) => (
                    <p key={i} className="text-lg text-slate-300 leading-relaxed mb-2">{line}</p>
                  ))}
                </div>
              )}
              {/* Code Content */}
              {currentModule.type === 'code' && 'code' in currentModule && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-green-300 mb-4">💻 Code Example</h3>
                  <div className="bg-slate-950 border border-slate-700 rounded-xl p-6 shadow-2xl">
                    <pre className="text-base leading-relaxed overflow-x-auto">
                      <code className="font-mono text-green-300">
                        {currentModule.code}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
              {/* Completion Section */}
              <div className="pt-8 border-t border-slate-700">
                {!completedModules.has(moduleId) ? (
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-lg transition-all shadow-lg" 
                    onClick={markAsCompleted}
                  >
                    <CheckCircle className="mr-3 h-5 w-5" />
                    Mark Complete
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-xl font-semibold">Completed! ✨</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline" 
              onClick={() => window.location.href = `/courses/polygon-101/lesson/${moduleId - 1}`} 
              disabled={moduleId === 1}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-6 py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Previous Lesson
            </Button>
            <Button
              variant="outline" 
              onClick={() => {
                if (moduleId === modules.length) {
                  window.location.href = '/courses/polygon-101';
                } else {
                  window.location.href = `/courses/polygon-101/lesson/${moduleId + 1}`;
                }
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-6 py-3"
            >
              {moduleId === modules.length ? 'Finish Course' : 'Next Lesson'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
