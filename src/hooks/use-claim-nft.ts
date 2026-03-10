'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getBlockchainErrorInfo } from '@/lib/blockchain-errors';
import { getExplorerTxUrl } from '@/lib/contracts';

interface ClaimResult {
  nft?: {
    id: string;
    name: string;
    tokenId?: string;
    transactionHash?: string;
    contractAddress?: string;
    chainId?: number;
    ownerAddress?: string;
  };
}

export function useClaimNFT() {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);

  const claimNFT = async (courseSlug: string) => {
    if (isClaiming || claimed) return;

    setIsClaiming(true);
    try {
      const res = await fetch('/api/user/course/claim-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug })
      });

      const data = await res.json();

      if (res.ok) {
        setClaimed(true);
        setClaimResult(data);
        const nft = data.nft;
        const isOnChain = nft?.transactionHash && !/^0x0+$/.test(nft.transactionHash);
        const explorerUrl = isOnChain && nft?.chainId
          ? getExplorerTxUrl(nft.chainId, nft.transactionHash!)
          : null;

        if (isOnChain) {
          toast.success('🎉 NFT minted on-chain!', {
            description: `${nft?.name} has been minted to ${nft?.ownerAddress ? `${nft.ownerAddress.slice(0, 6)}...${nft.ownerAddress.slice(-4)}` : 'your wallet'}.${nft?.tokenId ? ` Token #${nft.tokenId}` : ''}`,
            duration: 10000,
            action: explorerUrl ? {
              label: 'View on Explorer',
              onClick: () => window.open(explorerUrl, '_blank'),
            } : undefined,
          });
        } else {
          toast.success('🎉 NFT claimed successfully!', {
            description: `${nft?.name} has been recorded. Connect a wallet to mint it on-chain.`,
            duration: 8000,
          });
        }
        return data.nft;
      } else {
        if (data.message?.includes('already claimed')) {
          setClaimed(true);
          toast.info('NFT already claimed', {
            description: 'You already own this NFT badge.'
          });
        } else {
          toast.error('Failed to claim NFT', {
            description: typeof data.error === 'string' ? data.error : (data.error ? JSON.stringify(data.error) : 'Please try again later.')
          });
        }
      }
    } catch (err) {
      const info = getBlockchainErrorInfo(err);
      toast.error(info.title, {
        description: info.description || 'Network error. Please try again.'
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return { claimNFT, isClaiming, claimed, claimResult };
}
