"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { parseEther, decodeEventLog } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Sparkles,
  Wallet,
  Coins,
  Network,
  SmartphoneNfc,
  ShieldCheck,
  ArrowRight,
  PawPrint,
  Globe,
  Gift,
} from "lucide-react";
import { getPublicClient, getWalletClient } from "@/lib/viem";
import { paymentManagerAbi } from "@/abi/paymentManager";
import { PM_ADDRESS, TREASURY_ADDRESS } from "@/lib/addresses";

type Plan = {
  id: string;
  name: string;
  badge?: string;
  priceLabel: string;
  subLabel: string;
  description: string;
  gradient: string;
  features: string[];
  cta: string;
  micro?: boolean;
};

const AMOY_CHAIN_ID_HEX = "0x13882"; // 80002 Polygon Amoy
const RECEIPTS_KEY = "x402_payments";

export default function Pricing() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);
  const onChainAvailable = Boolean(
    PM_ADDRESS && process.env.NEXT_PUBLIC_AMOY_RPC && TREASURY_ADDRESS
  );

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "micro",
        name: "MicroDApp",
        badge: "Pay-per-lesson",
        priceLabel: "0.05 MATIC",
        subLabel: "per lesson",
        description: "Agentic micropayments per lesson via x402 routing.",
        gradient: "from-emerald-500 to-cyan-600",
        features: [
          "Agent-initiated payments",
          "Instant unlock on success",
          "NFT drops on milestones",
          "Works with ENS identity",
        ],
        cta: "Pay with x402",
        micro: true,
      },
      {
        id: "pro",
        name: "Pro",
        badge: "Most popular",
        priceLabel: "3.5 MATIC",
        subLabel: "per month",
        description: "Subscription for active learners. Auto-renew (agent).",
        gradient: "from-purple-600 to-pink-600",
        features: [
          "Monthly agentic renewal",
          "Buddy rewards + streak boosts",
          "Access to all Pro courses",
          "Priority feature access",
        ],
        cta: "Subscribe with x402",
      },
      {
        id: "team",
        name: "Team",
        priceLabel: "12 MATIC",
        subLabel: "per month",
        description: "Cohorts, classrooms, and agent-run POS tooling.",
        gradient: "from-amber-500 to-orange-600",
        features: [
          "Agent-run POS flows",
          "Refund + dispute workflows",
          "Transaction tracking",
          "Reconciliation exports",
        ],
        cta: "Start Team Plan",
      },
    ],
    []
  );

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    (async () => {
      try {
        const accounts = await ethereum?.request?.({ method: "eth_accounts" });
        if (accounts?.[0]) setConnected(accounts[0]);
      } catch {}
    })();
  }, []);

  const switchToAmoy = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum?.request) {
      toast.error("No wallet found. Install MetaMask or similar.");
      return false;
    }
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchErr: any) {
      if (switchErr?.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: AMOY_CHAIN_ID_HEX,
                chainName: "Polygon Amoy",
                rpcUrls: [process.env.NEXT_PUBLIC_AMOY_RPC || "https://rpc-amoy.polygon.technology"],
                nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                blockExplorerUrls: ["https://www.oklink.com/amoy"],
              },
            ],
          });
          return true;
        } catch {
          toast.error("Failed to add Polygon Amoy to wallet.");
          return false;
        }
      }
      toast.error("Please switch to Polygon Amoy and try again.");
      return false;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum?.request) {
      toast.error("No wallet found. Install MetaMask or similar.");
      return;
    }
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setConnected(accounts?.[0] || null);
  }, []);

  const ensureAmoy = useCallback(async () => {
    const ok = await switchToAmoy();
    if (!ok) throw new Error("Switch to Polygon Amoy to continue.");
  }, [switchToAmoy]);

  const saveReceipt = (record: any) => {
    const prev = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify([record, ...prev]));
  };

  const parseAmount = (label: string) => {
    const n = (label || "").split(" ")[0]; // "0.05 MATIC" -> "0.05"
    return parseEther(n as `${number}`);
  };

  const writeMicropayment = useCallback(
    async (plan: Plan) => {
      await ensureAmoy();
      const wallet = getWalletClient();
      const pub = getPublicClient();
      if (!wallet || !connected) throw new Error("Connect wallet to continue.");
      if (!onChainAvailable) throw new Error("PaymentManager not configured.");

      const value = parseAmount(plan.priceLabel);
      const memo = `EthEd:${plan.id}:micropayment:${Date.now()}`;
      const hash = await wallet.writeContract({
        address: PM_ADDRESS as `0x${string}`,
        abi: paymentManagerAbi,
        functionName: "createMicropayment",
        args: [TREASURY_ADDRESS as `0x${string}`, memo],
        value,
        account: connected as `0x${string}`,
        chain: undefined,
      });

      toast.info("Submitting micropayment...");
      const receipt = await pub.waitForTransactionReceipt({ hash });
      toast.success("Payment confirmed on-chain.");

      let idHex = "";
      try {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: paymentManagerAbi,
              data: log.data,
              topics: log.topics as any,
            });
            if (decoded.eventName === "PurchaseCreated") {
              idHex = (decoded.args as any).id;
              break;
            }
          } catch {}
        }
      } catch {}

      saveReceipt({
        id: idHex || `PM-${hash.slice(0, 10)}`,
        plan: plan.id,
        amount: plan.priceLabel,
        type: "micropayment",
        network: "Polygon Amoy",
        txHash: hash,
        at: new Date().toISOString(),
      });
    },
    [connected, onChainAvailable, ensureAmoy]
  );

  const writeSubscription = useCallback(
    async (plan: Plan) => {
      await ensureAmoy();
      const wallet = getWalletClient();
      const pub = getPublicClient();
      if (!wallet || !connected) throw new Error("Connect wallet to continue.");
      if (!onChainAvailable) throw new Error("PaymentManager not configured.");

      const months = BigInt(1);
      const value = parseAmount(plan.priceLabel);
      const memo = `EthEd:${plan.id}:subscription:${Date.now()}`;

      const hash = await wallet.writeContract({
        address: PM_ADDRESS as `0x${string}`,
        abi: paymentManagerAbi,
        functionName: "createSubscription",
        args: [TREASURY_ADDRESS as `0x${string}`, months, memo],
        value,
        account: connected as `0x${string}`,
        chain: undefined,
      });

      toast.info("Submitting subscription...");
      const receipt = await pub.waitForTransactionReceipt({ hash });
      toast.success("Subscription confirmed on-chain.");

      let idHex = "";
      try {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: paymentManagerAbi,
              data: log.data,
              topics: log.topics as any,
            });
            if (decoded.eventName === "PurchaseCreated") {
              idHex = (decoded.args as any).id;
              break;
            }
          } catch {}
        }
      } catch {}

      saveReceipt({
        id: idHex || `PM-${hash.slice(0, 10)}`,
        plan: plan.id,
        amount: plan.priceLabel,
        type: "subscription",
        network: "Polygon Amoy",
        txHash: hash,
        at: new Date().toISOString(),
      });
    },
    [connected, onChainAvailable, ensureAmoy]
  );

  const refundLastPayment = useCallback(async () => {
    await ensureAmoy();
    const wallet = getWalletClient();
    const pub = getPublicClient();
    if (!wallet || !connected) throw new Error("Connect wallet to continue.");
    if (!onChainAvailable) throw new Error("PaymentManager not configured.");

    const receipts = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
    const target = receipts.find((r: any) => r.type === "micropayment");
    if (!target?.id) {
      toast.error("No micropayment found to refund.");
      return;
    }

    const hash = await wallet.writeContract({
      address: PM_ADDRESS as `0x${string}`,
      abi: paymentManagerAbi,
      functionName: "refundPayment",
      args: [target.id as `0x${string}`],
      account: connected as `0x${string}`,
      chain: undefined,
    });

    toast.info("Submitting refund...");
    await pub.waitForTransactionReceipt({ hash });
    toast.success("Refund processed.");

    saveReceipt({
      id: target.id,
      plan: target.plan,
      amount: target.amount,
      type: "refund",
      network: "Polygon Amoy",
      txHash: hash,
      at: new Date().toISOString(),
    });
  }, [connected, onChainAvailable, ensureAmoy]);

  const simulateX402Payment = useCallback(
    async (plan: Plan) => {
      if (loadingId) return;
      setLoadingId(plan.id);
      const ok = await switchToAmoy();
      if (!ok) {
        setLoadingId(null);
        return;
      }
      toast.info("x402: Routing payment via agent...", { duration: 1200 });
      await new Promise((r) => setTimeout(r, 1000));
      toast.info("x402: Risk checks + policy...", { duration: 1000 });
      await new Promise((r) => setTimeout(r, 900));
      const receiptId = `LB-X402-${Date.now().toString(36).toUpperCase()}`;
      saveReceipt({
        id: receiptId,
        plan: plan.id,
        amount: plan.priceLabel,
        type: plan.micro ? "micropayment" : "subscription",
        network: "Polygon Amoy",
        at: new Date().toISOString(),
      });
      toast.success(`Payment Success • ${plan.priceLabel} • ${receiptId}`);
      setLoadingId(null);
    },
    [loadingId, switchToAmoy]
  );

  const handlePlan = async (plan: Plan) => {
    if (loadingId) return;
    setLoadingId(plan.id);
    try {
      if (!connected) await connectWallet();

      if (onChainAvailable) {
        if (plan.micro) {
          await writeMicropayment(plan);
        } else {
          await writeSubscription(plan);
        }
      } else {
        await simulateX402Payment(plan);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Payment failed.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* EthEd radial/glow background to match hero */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-300/15 via-background to-background" />
        <div className="absolute top-10 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            {onChainAvailable
              ? "Live: x402 via PaymentManager on Polygon Amoy"
              : "x402 Agentic Payments (Simulated)"}
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Simple pricing for learning that you own
          </h1>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            Pay per lesson with agentic micropayments or subscribe monthly. Your
            ENS identity, your NFTs, your progress—portable across EthEd.
          </p>
          {/* Wallet + network */}
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <Network className="w-4 h-4 text-cyan-400" />
            Polygon Amoy (80002)
            <Button
              variant="outline"
              className="ml-2 h-7 border-cyan-500/40 text-cyan-300"
              onClick={switchToAmoy}
            >
              Switch Network
            </Button>
            <Button
              variant="outline"
              className="ml-2 h-7 border-emerald-500/40 text-emerald-300"
              onClick={connectWallet}
            >
              {connected ? `${connected.slice(0, 6)}...${connected.slice(-4)}` : "Connect Wallet"}
            </Button>
          </div>
        </motion.div>

        {/* Core value props (commercial, product-focused) */}
        <section className="mb-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <PawPrint className="w-5 h-5 text-emerald-400" />,
                title: "AI Buddy",
                desc: "Guides lessons, nudges, and rewards.",
              },
              {
                icon: <Globe className="w-5 h-5 text-cyan-400" />,
                title: "ENS Identity",
                desc: "username.ethed.eth for your profile.",
              },
              {
                icon: <Gift className="w-5 h-5 text-purple-400" />,
                title: "NFT Credentials",
                desc: "Earn verifiable badges as you learn.",
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
                title: "x402 Payments",
                desc: "Micropay or subscribe—agentic and fast.",
              }
            ].map((v) => (
                <div key={v.title} className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/50 px-3 py-1 text-xs text-slate-300">
                    {v.icon}
                    {v.title}
                  </div>
                  <p className="mt-2 text-slate-400 text-sm">{v.desc}</p>
                </div>
              ))}
          </div>
        </section>

        {/* Plans */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">
              {onChainAvailable
                ? "Subscriptions and Micropay (On-chain)"
                : "Subscriptions and Micropay (Simulated)"}
            </h2>
            <p className="text-slate-400 text-sm">
              {onChainAvailable
                ? "Transactions route through PaymentManager on Polygon Amoy."
                : "Configure env to enable live on-chain payments via PaymentManager."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative overflow-hidden bg-slate-800/40 backdrop-blur-xl border border-white/10 h-full">
                  <div className={`pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-r ${plan.gradient} opacity-20 blur-2xl`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{plan.name}</CardTitle>
                      {plan.badge && (
                        <Badge variant="outline" className="border-emerald-400/30 text-emerald-300">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">{plan.priceLabel}</span>
                      <span className="ml-2 text-sm text-slate-400">{plan.subLabel}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Separator className="my-3 bg-white/10" />
                    <ul className="space-y-2 text-sm text-slate-300">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-5 w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
                      onClick={() => handlePlan(plan)}
                      disabled={loadingId === plan.id}
                    >
                      {loadingId === plan.id ? (
                        <span className="inline-flex items-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          Processing...
                        </span>
                      ) : (
                        <>
                          {plan.micro ? <Coins className="w-4 h-4 mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                          {onChainAvailable ? plan.cta : `Simulate: ${plan.cta}`}
                        </>
                      )}
                    </Button>
                    {plan.micro && (
                      <Button
                        variant="outline"
                        className="mt-2 w-full border-purple-400/30 text-purple-300 hover:text-white"
                        onClick={() => {
                          toast.info("NFC bracelet tapped (demo)...");
                          setTimeout(() => handlePlan(plan), 900);
                        }}
                        disabled={loadingId === plan.id}
                      >
                        <SmartphoneNfc className="w-4 h-4 mr-2" />
                        NFC Tap (Demo)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Receipts + POS (commercial reconciliation) */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Receipts & Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ReceiptsList />
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="border-yellow-500/40 text-yellow-300" onClick={refundLastPayment}>
                  Refund last micropayment
                </Button>
                <Button
                  variant="ghost"
                  className="text-slate-300"
                  onClick={() => {
                    localStorage.removeItem(RECEIPTS_KEY);
                    toast.success("Cleared local receipts");
                    window.location.reload();
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Agent POS & Reconciliation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-3">
              <div className="rounded-lg border border-white/10 p-3 bg-slate-700/30">
                PaymentManager emits PurchaseCreated, PurchaseCompleted, RefundProcessed. Your backend indexes events to reconcile subscriptions and refunds.
              </div>
              <div className="rounded-lg border border-white/10 p-3 bg-slate-700/30">
                Commercial flow: micropay unlocks lessons, subscriptions gate Pro content, refunds resolve disputes—all verifiable on-chain.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

// Helper: list receipts
function ReceiptsList() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const rec = JSON.parse(localStorage.getItem("x402_payments") || "[]");
    setItems(rec.slice(0, 8));
  }, []);
  if (!items.length) return <div className="text-slate-400 text-sm">No receipts yet.</div>;
  return (
    <div className="space-y-2">
      {items.map((r) => (
        <div key={`${r.id}-${r.at}`} className="flex items-center justify-between rounded-md border border-white/10 bg-slate-700/30 p-2">
          <div className="text-xs text-slate-300">
            <div className="font-medium text-white">{r.type.toUpperCase()} • {r.plan}</div>
            <div className="text-slate-400">{r.amount} • {new Date(r.at).toLocaleString()}</div>
            {r.txHash ? <div className="text-cyan-300">Tx: {r.txHash.slice(0, 10)}...</div> : null}
          </div>
          <Badge variant="outline" className="text-emerald-300 border-emerald-400/30">{r.network}</Badge>
        </div>
      ))}
    </div>
  );
}