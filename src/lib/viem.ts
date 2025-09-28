import { createPublicClient, createWalletClient, http, custom } from "viem";

export const AMOY = {
  id: 80002,
  name: "Polygon Amoy",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_AMOY_RPC || "https://rpc-amoy.polygon.technology"],
    },
  },
} as const;

export function getPublicClient() {
  return createPublicClient({
    chain: AMOY as any,
    transport: http(AMOY.rpcUrls.default.http[0]),
  });
}

export function getWalletClient() {
  if (typeof window === "undefined" || !(window as any).ethereum) return null;
  return createWalletClient({
    chain: AMOY as any,
    transport: custom((window as any).ethereum),
  });
}