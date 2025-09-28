"use client";

import { useState, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { toast } from "sonner";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useSiwe() {
  const { data: session, status } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask or another Web3 wallet");
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const address = accounts[0];

      // Get nonce from server
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      if (!nonce) {
        throw new Error("Failed to get nonce");
      }

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to EthEd with your Ethereum account.",
        uri: window.location.origin,
        version: "1",
        chainId: parseInt(chainId, 16),
        nonce,
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      });

      // Sign the message
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message.prepareMessage(), address],
      });

      // Sign in with NextAuth
      const result = await signIn("siwe", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Successfully connected wallet!");
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      await signOut({ redirect: false });
      toast.success("Wallet disconnected");
    } catch (error: any) {
      console.error("Wallet disconnection error:", error);
      toast.error("Failed to disconnect wallet");
    } finally {
      setIsDisconnecting(false);
    }
  }, []);

  return {
    session,
    status,
    isConnecting,
    isDisconnecting,
    connectWallet,
    disconnectWallet,
    isConnected: !!session?.address,
    address: session?.address,
  };
}