import { env } from "@/env";
import { PinataSDK } from "pinata";
import { logger } from "./monitoring";

// ---------------------------------------------------------------------------
// Startup checks
// ---------------------------------------------------------------------------

if (!env.PINATA_JWT && env.NODE_ENV === "production") {
  logger.error(
    "PINATA_JWT is not set — IPFS uploads WILL fail in production",
    "pinata"
  );
}

// ---------------------------------------------------------------------------
// SDK instance
// ---------------------------------------------------------------------------

export const pinata = new PinataSDK({
  pinataJwt: env.PINATA_JWT,
  pinataGateway: env.PINATA_GATEWAY_URL,
});

// ---------------------------------------------------------------------------
// Typed helpers (wrap the untyped SDK methods)
// ---------------------------------------------------------------------------

export interface PinataUploadResult {
  id?: string;
  cid?: string;
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload a file (Buffer / File / Blob) to Pinata.
 * Returns canonical `ipfs://` URI.
 */
export async function pinFile(file: File): Promise<string> {
  if (!env.PINATA_JWT) {
    throw new Error("Pinata not configured (PINATA_JWT missing)");
  }
  const result = (await (pinata as unknown as { upload: { public: { file: (f: File) => Promise<PinataUploadResult> } } }).upload.public.file(file)) as PinataUploadResult;
  const cid = result.cid || result.IpfsHash;
  if (!cid) {
    throw new Error("Pinata upload did not return a CID");
  }
  return `ipfs://${cid}`;
}

/**
 * Upload a JSON object to Pinata.
 * Returns canonical `ipfs://` URI.
 */
export async function pinJSON(data: Record<string, unknown>): Promise<string> {
  if (!env.PINATA_JWT) {
    throw new Error("Pinata not configured (PINATA_JWT missing)");
  }
  const result = (await (pinata as unknown as { upload: { public: { json: (d: Record<string, unknown>) => Promise<PinataUploadResult> } } }).upload.public.json(data)) as PinataUploadResult;
  const cid = result.cid || result.IpfsHash;
  if (!cid) {
    throw new Error("Pinata upload did not return a CID");
  }
  return `ipfs://${cid}`;
}
