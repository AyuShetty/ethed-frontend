"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wallet, Smartphone } from "lucide-react";
import { SiweMessage } from "siwe";
import { toast } from "sonner";
import { isAddress, getAddress } from "viem";
import { AMOY_CHAIN_ID, getChainConfig } from "@/lib/contracts";
import { getBlockchainErrorInfo } from "@/lib/blockchain-errors";
import { ensurePolygonChain, getWalletChainId } from "@/lib/wallet-client";
import { logger } from "@/lib/monitoring";

/**
 * Strip zero-width characters, smart quotes, non-ASCII whitespace that
 * mobile keyboards / copy-paste inject.
 */
function sanitizeAddress(raw: string): string {
  return raw
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g, "")
    .replace(/[\u2018\u2019\u201C\u201D]/g, "")
    .replace(/[\s\u00A0]+/g, " ")
    .trim();
}

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function metamaskDeepLink(): string {
  if (typeof window === "undefined") return "https://metamask.io/download/";
  const dappUrl = window.location.href.replace(/^https?:\/\//, "");
  return `https://metamask.app.link/dapp/${dappUrl}`;
}

export function SiweLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const isMobile = useMemo(() => isMobileBrowser(), []);
  const hasInjectedWallet = typeof window !== "undefined" && !!window.ethereum;

  const handleSiweSignIn = async () => {
    try {
      setIsLoading(true);

      // Step 1: Check wallet availability
      setStatusMessage("Detecting wallet…");
      if (!window.ethereum) {
        if (isMobile) {
          window.location.href = metamaskDeepLink();
          return;
        }
        toast.error("No wallet detected", {
          description: "Please install a Web3 wallet like MetaMask to sign in with Ethereum.",
        });
        return;
      }

      // Step 2: Request accounts
      setStatusMessage("Requesting wallet access…");
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || !accounts[0]) {
        toast.error("No accounts found", {
          description: "Please unlock your wallet and try again.",
        });
        return;
      }

      const rawAddr = sanitizeAddress(String(accounts[0]));

      // Defensive normalization
      let addr = rawAddr.trim();
      if (addr.includes(":")) {
        addr = addr.split(":").pop() || addr;
      }
      
      const hexOnly = addr.replace(/^0x/i, "").replace(/[^a-fA-F0-9]/g, "");
      const normalizedAddress = `0x${hexOnly}`;

      if (!isAddress(normalizedAddress)) {
        logger.error("Invalid address after normalization", "SiweLoginButton", { 
          raw: rawAddr, 
          normalized: normalizedAddress 
        });
        throw new Error("Invalid address format");
      }

      const address = getAddress(normalizedAddress);

      // Step 3: Ensure correct network
      setStatusMessage("Checking network…");
      const currentChainId = await getWalletChainId();
      if (currentChainId !== AMOY_CHAIN_ID) {
        setStatusMessage("Switching to Polygon…");
        try {
          await ensurePolygonChain();
          const chain = getChainConfig(AMOY_CHAIN_ID);
          toast.success("Network updated", {
            description: `Connected to ${chain.name}.`,
          });
        } catch (switchError) {
          const info = getBlockchainErrorInfo(switchError);
          if (info.code === 4001) {
            toast.error("Network switch required", {
              description: "You need to switch to Polygon mainnet to sign in. Please approve the network switch and try again.",
            });
          } else {
            toast.error(info.title, {
              description: info.description || "Failed to switch to Polygon. Please switch manually in your wallet settings (Chain ID: 137).",
            });
          }
          return;
        }
      }

      // Step 4: Get nonce
      setStatusMessage("Preparing sign-in challenge…");
      const nonceResponse = await fetch("/api/auth/siwe/nonce");
      if (!nonceResponse.ok) {
        toast.error("Failed to start sign-in", {
          description: "Could not fetch a login challenge. Please check your connection and try again.",
        });
        return;
      }
      const { nonce } = await nonceResponse.json();
      if (!nonce) {
        toast.error("Failed to start sign-in", {
          description: "Login challenge was missing. Please refresh the page and try again.",
        });
        return;
      }

      try {
        const hasCookie = typeof document !== 'undefined' && document.cookie.includes('siwe-nonce=');
        if (!hasCookie) {
          logger.warn('`siwe-nonce` not visible to document.cookie (expected for HttpOnly). Proceeding.', 'SiweLoginButton');
        }
      } catch {
        // Ignore cookie-check errors
      }

      // Re-check chain ID after potential switch
      const chainIdRaw = await window.ethereum.request({
        method: "eth_chainId",
      });
      const chainId = typeof chainIdRaw === 'string' ? parseInt(chainIdRaw, 16) : Number(chainIdRaw);

      if (isNaN(chainId)) {
        throw new Error("Invalid chain ID received from wallet.");
      }

      // Step 5: Create and sign SIWE message
      setStatusMessage("Please sign the message in your wallet…");
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to EIPsInsight Academy",
        uri: window.location.origin,
        version: "1",
        chainId: chainId,
        nonce: nonce,
      });

      const messageToSign = message.prepareMessage();

      let signature: string;
      try {
        signature = await window.ethereum.request({
          method: "personal_sign",
          params: [messageToSign, address],
        }) as string;
      } catch (signError) {
        const info = getBlockchainErrorInfo(signError);
        if (info.code === 4001) {
          toast.error("Signature declined", {
            description: "You cancelled the signature request. Please try again and approve the message in your wallet.",
          });
        } else {
          toast.error(info.title, {
            description: info.description || "Failed to sign the login message. Please try again.",
          });
        }
        return;
      }

      // Step 6: Verify with server
      setStatusMessage("Verifying signature…");
      const result = await signIn("siwe", {
        message: messageToSign,
        signature: signature,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result?.ok) {
        const rawErr = (result as unknown as Record<string, unknown>)?.error;
        if (rawErr) {
          const errStr = typeof rawErr === 'string' ? rawErr : '';
          if (errStr.toLowerCase().includes('wrong network') || errStr.toLowerCase().includes('chain')) {
            toast.error("Wrong network detected", {
              description: "Please switch your wallet to Polygon mainnet (Chain ID: 137) and try again.",
            });
          } else if (errStr.toLowerCase().includes('nonce') || errStr.toLowerCase().includes('expired')) {
            toast.error("Session expired", {
              description: "Your sign-in session has expired. Please try again — a fresh challenge will be generated.",
            });
          } else {
            const info = getBlockchainErrorInfo(rawErr);
            toast.error(info.title, { description: info.description || (typeof rawErr === 'string' ? rawErr : JSON.stringify(rawErr)) });
          }
        } else {
          toast.error("Sign in failed", { description: "Could not complete sign-in. Please try again." });
        }
        return;
      }

      // Step 7: Success
      setStatusMessage("Sign-in successful! Redirecting…");
      toast.success("Welcome!", {
        description: "You have been signed in successfully.",
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      const info = getBlockchainErrorInfo(error);
      toast.error(info.title, {
        description: info.description || "Failed to sign in with Ethereum. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSiweSignIn}
        disabled={isLoading}
        variant="outline"
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isMobile && !hasInjectedWallet ? (
          <Smartphone className="mr-2 h-4 w-4" />
        ) : (
          <Wallet className="mr-2 h-4 w-4" />
        )}
        {isLoading
          ? (statusMessage || "Connecting...")
          : isMobile && !hasInjectedWallet
            ? "Open in MetaMask"
            : "Sign in with Ethereum"}
      </Button>
      {isLoading && statusMessage && (
        <p className="text-xs text-center text-muted-foreground animate-pulse">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
