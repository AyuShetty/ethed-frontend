'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock, Play, FileText, Code, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const modules = [
  {
    id: 1,
    type: 'video',
    title: 'Introduction to 0G',
    duration: '15 min',
    videoUrl: 'https://www.youtube.com/embed/l0Jdye-MhVQ',
    description: 'Learn what makes 0G the first AI-native blockchain and how it solves critical infrastructure challenges.',
  },
  {
    id: 2,
    type: 'text',
    title: 'Storage Architecture',
    duration: '20 min',
    content: `# Storage Architecture

## The Challenge

AI applications need to store and retrieve massive amounts of data - training datasets, model weights, embeddings, and more. Traditional blockchain storage is prohibitively expensive and slow.

## 0G's Approach

0G separates **data availability** from **data storage**:

**Data Availability**: What data exists and where to find it (on-chain)
**Data Storage**: The actual data content (off-chain, but verifiable)

## Architecture Components

**Storage Nodes**: Hold the actual data chunks
**Indexing Network**: Maintains data location and availability proofs
**Retrieval Protocol**: Efficiently fetches data when needed

## Cryptographic Guarantees

Even though data lives off-chain, you get blockchain-level security:
- **Merkle proofs** verify data integrity
- **Erasure coding** ensures availability even if nodes go offline
- **Cryptographic commitments** prove data hasn't been tampered with

## Practical Benefits

**Cost**: 1000x cheaper than on-chain storage
**Speed**: Parallel retrieval from multiple nodes
**Scale**: Petabytes of data without blockchain bloat
**Security**: Cryptographic proofs ensure data integrity

This enables AI applications that were previously impossible on blockchain - like storing entire language model weights or massive training datasets.`,
    description: 'Understand how 0G achieves massive scale storage with cryptographic security guarantees.',
  },
  {
    id: 3,
    type: 'text',
    title: 'Compute and Inference',
    duration: '18 min',
    content: `# Compute and Inference

## Decentralized AI Inference

0G creates a marketplace where GPU providers offer compute resources and AI developers consume them through a unified interface.

## Key Components

**GPU Providers**: Operators who offer compute resources
**Inference Brokers**: Route requests to optimal providers
**Settlement Layer**: Handles payments and dispute resolution
**Verification System**: Ensures compute results are correct

## How It Works

1. **Request**: Developer submits AI inference request
2. **Routing**: Broker finds best available GPU provider
3. **Execution**: Provider runs the AI model
4. **Verification**: Result is cryptographically verified
5. **Payment**: Automatic micropayment to provider

## Economic Model

**Pay-per-inference**: Only pay for actual compute used
**Market pricing**: Competition drives costs down
**Quality incentives**: Better providers earn more
**Stake-based security**: Providers stake tokens to participate

## Advantages Over Centralized

**No vendor lock-in**: Switch providers seamlessly
**Global resource pool**: Access GPUs worldwide
**Transparent pricing**: Market-driven rates
**Censorship resistant**: No single point of control

The result is enterprise-grade AI infrastructure that's more affordable, accessible, and aligned with Web3 principles.`,
    description: 'Explore 0G\'s decentralized compute marketplace and how it enables scalable AI inference.',
  },
  {
    id: 4,
    type: 'text',
    title: 'Settlement and Coordination',
    duration: '22 min',
    content: `# Settlement and Coordination

## The Settlement Layer

While storage and compute happen off-chain for efficiency, the settlement layer provides the "source of truth" for coordination, payments, and dispute resolution.

## EVM Compatibility

0G's settlement layer is **fully EVM-compatible**, meaning:
- Use existing Ethereum tools and frameworks
- Deploy Solidity smart contracts unchanged
- Integrate with familiar wallets and infrastructure
- Leverage existing DeFi protocols

## Key Functions

**Resource Registration**: GPU providers and storage nodes register on-chain
**Payment Rails**: Handle micropayments between users and providers
**Dispute Resolution**: Adjudicate conflicts using cryptographic proofs
**Governance**: Protocol upgrades and parameter changes

## Smart Contract Integration

AI applications can embed logic directly in smart contracts:
- **Trigger inference** based on on-chain events
- **Store results** back to blockchain when needed
- **Conditional payments** based on AI outcomes
- **Automated workflows** combining AI and DeFi

## Practical Example

A DeFi protocol could:
1. Monitor market conditions via smart contract
2. Trigger AI analysis when volatility exceeds threshold
3. Execute trades based on AI recommendations
4. All payments and verification happen automatically

This creates a seamless bridge between traditional blockchain applications and AI-powered functionality.`,
    description: 'Learn how 0G\'s EVM-compatible settlement layer coordinates the entire AI stack.',
  },
  {
    id: 5,
    type: 'text',
    title: 'Inference via the Broker',
    duration: '20 min',
    content: `# Inference via the Broker

The 0G Inference SDK introduces a **Broker** that handles all the complexity of decentralized AI inference.

## The Travel Agent Analogy

Think of the Broker as a **travel agent for AI:**
- **Picks the best GPU "flight"** from available providers
- **Pays from your prepaid wallet** automatically  
- **Returns a stamped ticket** that proves the trip happened
- **Handles all routing and verification** behind the scenes

## What the Broker Does

**Authentication**: Verifies you have permission to use inference
**Billing**: Streams micropayments to GPU providers per request
**Provider Routing**: Finds the best available compute for your needs
**Verification**: Ensures results are legitimate and untampered

## Prepaid Accounts

You fund an account upfront, then:
- Each inference request deducts the appropriate amount
- No need to negotiate with individual providers
- Automatic, seamless payments per request
- Full transparency on costs and usage

## SDK Integration

The complexity is hidden - you get enterprise-grade AI infrastructure with a simple API call. Just call the broker with your model and prompt parameters, and it handles all the routing, payments, and verification automatically.`,
    description: 'Master the 0G Inference Broker - your gateway to decentralized AI infrastructure.',
  },
  {
    id: 6,
    type: 'text',
    title: 'Security and Integrity',
    duration: '25 min',
    content: `# Security and Integrity

0G provides multiple layers of security to ensure your AI applications are trustworthy and verifiable.

## Storage Security

**Cryptographic Commitment**: Every piece of data gets a unique cryptographic fingerprint
**Erasure Coding**: Data is split and replicated across multiple nodes
**Merkle Proofs**: Verify data integrity without downloading the entire file
**Immutable References**: Once stored, data cannot be altered

## Compute Verification

**Deterministic Execution**: Same input always produces same output
**Cryptographic Proofs**: Verify computations were performed correctly
**Stake-based Security**: Providers risk staked tokens for honest behavior
**Fraud Detection**: Challenge mechanism for suspicious results

## Economic Security

**Incentive Alignment**: Honest behavior is more profitable than dishonest
**Slashing Conditions**: Penalties for provably bad behavior
**Reputation Systems**: Track provider performance over time
**Insurance Mechanisms**: Protect users from provider failures

## Privacy Considerations

**Optional Encryption**: Encrypt data before uploading
**Zero-Knowledge Proofs**: Prove computations without revealing inputs
**Access Control**: Fine-grained permissions for data access
**Private Inference**: Run AI models without exposing sensitive data

## Best Practices

**Data Validation**: Always verify downloaded data integrity
**Key Management**: Secure your cryptographic keys properly
**Monitoring**: Watch for unusual activity or costs
**Redundancy**: Don't rely on single providers for critical operations

Security in decentralized systems requires understanding both the protocol guarantees and your application's specific threat model.`,
    description: 'Understand 0G\'s multi-layered security model and best practices for safe AI operations.',
  },
  {
    id: 7,
    type: 'code',
    title: 'Lab A: First File Up and Back',
    duration: '30 min',
    code: `// Lab A: First File Upload to 0G Storage
// This lab walks you through your first file upload and retrieval

// Step 1: Initialize the 0G client
const client = new ZGClient({
  nodeUrl: 'https://rpc-testnet.0g.ai',
  privateKey: process.env.PRIVATE_KEY
});

// Step 2: Upload a file
const file = fs.readFileSync('./test.txt');
const result = await client.upload(file);
console.log('Upload hash:', result.hash);

// Step 3: Download the file back
const downloaded = await client.download(result.hash);
console.log('File retrieved successfully!');

// Step 4: Verify integrity
const originalHash = crypto.createHash('sha256').update(file).digest('hex');
const downloadedHash = crypto.createHash('sha256').update(downloaded).digest('hex');
console.log('Integrity check:', originalHash === downloadedHash ? 'PASS' : 'FAIL');`,
    description: 'Upload your first file to 0G storage and retrieve it to verify the roundtrip works correctly.',
  },
  {
    id: 8,
    type: 'code',
    title: 'Lab B: AI Model Storage',
    duration: '45 min',
    code: `// Lab B: Storing and Loading ML Models on 0G
// Learn to store trained models and load them for inference

// Step 1: Save your trained model
import torch
import pickle
from zg_sdk import ZGClient

# Save model to bytes
model_bytes = pickle.dumps(trained_model.state_dict())

# Upload to 0G
client = ZGClient(node_url="https://rpc-testnet.0g.ai")
model_hash = await client.upload(model_bytes, metadata={
    "type": "pytorch_model",
    "architecture": "resnet18",
    "dataset": "cifar10"
})

print(f"Model stored with hash: {model_hash}")

# Step 2: Load model for inference
downloaded_bytes = await client.download(model_hash)
model_state = pickle.loads(downloaded_bytes)

# Reconstruct model
model = ResNet18()
model.load_state_dict(model_state)
model.eval()

# Step 3: Run inference
prediction = model(test_input)
print(f"Prediction: {prediction}")`,
    description: 'Store a machine learning model on 0G and load it for inference, demonstrating practical AI use cases.',
  },
  {
    id: 9,
    type: 'code',
    title: 'Lab C: Decentralized Inference',
    duration: '40 min',
    code: `// Lab C: Running AI Inference through 0G Network
// Use the inference broker to run models on decentralized compute

// Step 1: Initialize inference client
const inferenceClient = new ZGInference({
  brokerUrl: 'https://broker.0g.ai',
  apiKey: process.env.ZG_API_KEY
});

// Step 2: Submit inference request
const request = {
  model: 'gpt-3.5-turbo',
  prompt: 'Explain blockchain in simple terms',
  max_tokens: 150,
  temperature: 0.7
};

const result = await inferenceClient.complete(request);
console.log('Response:', result.text);
console.log('Provider:', result.provider_id);
console.log('Cost:', result.cost_usdc);

// Step 3: Verify the result cryptographically
const verification = await inferenceClient.verify(result.proof);
console.log('Verification:', verification.valid ? 'VALID' : 'INVALID');

// Step 4: Check billing
const usage = await inferenceClient.getUsage();
console.log('Total spent:', usage.total_cost_usdc);
console.log('Requests made:', usage.request_count);`,
    description: 'Run AI inference through the 0G compute network and verify results cryptographically.',
  },
  {
    id: 10,
    type: 'text',
    title: 'Capstone: AI-Powered DApp',
    duration: '2 hours',
    content: `# Capstone: AI-Powered DApp

## Project Overview

Build a complete decentralized application that showcases the full 0G stack - storage, compute, and smart contracts working together.

## Requirements

**Frontend**: Web interface for users to interact with your AI service
**Storage**: Use 0G storage for data persistence (user data, model weights, results)
**Compute**: Leverage 0G inference network for AI processing
**Smart Contracts**: Deploy coordination logic on 0G's settlement layer
**Integration**: Seamless user experience combining all components

## Project Ideas

**AI Content Generator**: Store prompts/results, use inference for generation
**Decentralized Analytics**: Store datasets, run ML analysis on-demand
**AI-Powered Trading Bot**: Store strategies, execute trades based on AI signals
**Collaborative ML**: Users contribute data, train models collectively

## Deliverables

- **Working dApp** deployed and accessible
- **Smart contracts** verified on 0G testnet
- **Documentation** explaining architecture and usage
- **Demo video** showing key features
- **Source code** with clear setup instructions

## Evaluation Criteria

**Functionality**: Does it work end-to-end?
**Innovation**: Creative use of 0G's capabilities
**User Experience**: Is it intuitive and polished?
**Technical Quality**: Clean code and good architecture
**Documentation**: Clear explanations and setup guide

This is your chance to build something meaningful that demonstrates real-world utility of decentralized AI infrastructure!`,
    description: 'Build a complete decentralized application that combines 0G storage, compute, and smart contracts for a real-world AI use case.',
  }
];

interface PageProps {
  params: { lessonId: string };
}

function renderTextContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (!line) {
      i++;
      continue;
    }

    // Main headings (# )
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-3xl font-bold text-white mb-6 mt-8 first:mt-0">
          {line.substring(2)}
        </h1>
      );
    }
    // Sub headings (## )
    else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-semibold text-green-300 mb-4 mt-6">
          {line.substring(3)}
        </h2>
      );
    }
    // List items
    else if (line.startsWith('- ')) {
      const listItems: React.ReactNode[] = [];
      let j = i;
      
      while (j < lines.length && lines[j].trim().startsWith('- ')) {
        const listLine = lines[j].trim();
        const itemText = listLine.substring(2);
        
        // Handle bold text in list items
        const formattedText = itemText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
        const parts = formattedText.split(/(<strong[^>]*>.*?<\/strong>)/);
        
        listItems.push(
          <li key={j} className="text-slate-300 mb-2 pl-2">
            {parts.map((part, idx) => {
              if (part.includes('<strong')) {
                const match = part.match(/<strong[^>]*>(.*?)<\/strong>/);
                return match ? <strong key={idx} className="text-white font-semibold">{match[1]}</strong> : part;
              }
              return part;
            })}
          </li>
        );
        j++;
      }
      
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-2 ml-4 mb-6">
          {listItems}
        </ul>
      );
      i = j - 1;
    }
    // Bold text paragraphs
    else if (line.includes('**')) {
      const formattedText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      const parts = formattedText.split(/(<strong[^>]*>.*?<\/strong>)/);
      
      elements.push(
        <p key={i} className="text-lg text-slate-300 leading-relaxed mb-4">
          {parts.map((part, idx) => {
            if (part.includes('<strong')) {
              const match = part.match(/<strong[^>]*>(.*?)<\/strong>/);
              return match ? <strong key={idx} className="text-white font-semibold">{match[1]}</strong> : part;
            }
            return part;
          })}
        </p>
      );
    }
    // Regular paragraphs
    else {
      elements.push(
        <p key={i} className="text-lg text-slate-300 leading-relaxed mb-4">
          {line}
        </p>
      );
    }
    
    i++;
  }

  return elements;
}

export default function LessonPage({ params }: PageProps) {
  const { lessonId } = params;
  const moduleId = parseInt(lessonId);
  const currentModule = modules.find(m => m.id === moduleId);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('0g-101-completed');
    if (saved) {
      setCompletedModules(new Set(JSON.parse(saved)));
    }
  }, []);

  const markAsCompleted = () => {
    const newCompleted = new Set([...completedModules, moduleId]);
    setCompletedModules(newCompleted);
    localStorage.setItem('0g-101-completed', JSON.stringify([...newCompleted]));
  };

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <Button asChild>
            <a href="/courses/0g-101">Back to Course</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          asChild
          className="mb-6 text-green-400 hover:text-green-300" 
        >
          <a href="/courses/0g-101">
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            Back to Course
          </a>
        </Button>

        <Card className="mb-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white mb-4">{currentModule.title}</CardTitle>
            <div className="flex items-center gap-4 mb-4">
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${
                currentModule.type === 'video' ? 'border-green-400/40 text-green-300' :
                currentModule.type === 'code' ? 'border-green-400/40 text-green-300' :
                'border-green-400/40 text-green-300'
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
                {renderTextContent(currentModule.content)}
              </div>
            )}
            {/* Code Content */}
            {currentModule.type === 'code' && 'code' in currentModule && (
              <div className="space-y-4">
                <pre className="bg-slate-950/50 border border-green-400/20 rounded-lg p-6 overflow-x-auto">
                  <code className="text-green-400 text-sm leading-relaxed whitespace-pre">
                    {currentModule.code}
                  </code>
                </pre>
                <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                  <p className="text-green-300 font-semibold mb-2">💡 Lab Instructions:</p>
                  <p className="text-slate-300 text-sm">
                    Copy the code above into your development environment and follow the comments step by step. 
                    Make sure you have the 0G SDK installed and your environment configured properly.
                  </p>
                </div>
              </div>
            )}

            {/* Completion Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={markAsCompleted}
                disabled={completedModules.has(moduleId)}
                className={`px-8 py-3 text-lg font-semibold ${
                  completedModules.has(moduleId)
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {completedModules.has(moduleId) ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {moduleId > 1 ? (
            <Button variant="outline" asChild className="border-green-400/40 text-green-300 hover:bg-green-400/10">
              <a href={`/courses/0g-101/lesson/${moduleId - 1}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Module
              </a>
            </Button>
          ) : (
            <div></div>
          )}
          
          {moduleId < modules.length ? (
            <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
              <a href={`/courses/0g-101/lesson/${moduleId + 1}`}>
                Next Module
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}