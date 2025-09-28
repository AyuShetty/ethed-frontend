"use client";

import { useState, useCallback } from "react";

interface ENSData {
  ensName?: string;
  ensAvatar?: string;
  address?: string;
  cached: boolean;
}

export function useENSLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupByAddress = useCallback(async (address: string): Promise<ENSData | null> => {
    if (!address) return null;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ens/lookup?address=${encodeURIComponent(address)}`);
      
      if (!response.ok) {
        throw new Error("ENS lookup failed");
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const lookupByName = useCallback(async (ensName: string): Promise<ENSData | null> => {
    if (!ensName) return null;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ens/lookup?name=${encodeURIComponent(ensName)}`);
      
      if (!response.ok) {
        throw new Error("ENS lookup failed");
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    lookupByAddress,
    lookupByName,
    loading,
    error,
  };
}