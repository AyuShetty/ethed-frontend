'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { switchToChain, getWalletChainId, getActiveWalletAddress, parseWalletError } from '@/lib/wallet-client';
import { AMOY_CHAIN_ID } from '@/lib/contracts';

export default function AddToWalletButton({ contractAddress, tokenId, chainId, ownerAddress }: { contractAddress: string; tokenId: string; chainId?: number; ownerAddress?: string | null; }) {
  const [isAdding, setIsAdding] = useState(false);

  const addToWallet = async () => {
    if (!contractAddress || !tokenId) {
      toast.error('NFT details missing or not on-chain yet.');
      return;
    }
    
    try {
      setIsAdding(true);
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        // Ensure user is on the correct network first
        const targetChainId = chainId || AMOY_CHAIN_ID;
        const currentChainId = await getWalletChainId();
        const activeAddress = await getActiveWalletAddress();

        // Use ownerAddress from database (populated during NFT claim)
        console.log('=== AddToWallet Debug Info ===');
        console.log('tokenId:', tokenId);
        console.log('activeAddress (MetaMask selected):', activeAddress);
        console.log('activeAddress (lowercase):', activeAddress?.toLowerCase());
        console.log('ownerAddress (from database):', ownerAddress);
        console.log('Match:', activeAddress?.toLowerCase() === ownerAddress?.toLowerCase());

        // Ownership check: compare active MetaMask account with stored owner
        if (!ownerAddress) {
          toast.error('Could not verify NFT ownership', {
            description: 'NFT owner address not found. Please try claiming the NFT again.',
          });
          return;
        }

        if (activeAddress && activeAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
          console.warn(`Ownership mismatch: active ${activeAddress?.toLowerCase()} !== owner ${ownerAddress?.toLowerCase()}`);
          toast.error('Active wallet does not own this NFT', {
            description: `Switch MetaMask to ${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)} before adding Token #${tokenId}.`,
          });
          return;
        }
        
        if (currentChainId !== targetChainId) {
          try {
            await switchToChain(targetChainId);
          } catch (switchError) {
            console.error('Failed to switch chain:', switchError);
            toast.error('Please switch your wallet to Polygon before adding the NFT.');
            setIsAdding(false);
            return;
          }
        }

        await (window as any).ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC721',
            options: {
              address: contractAddress,
              tokenId: tokenId,
            },
          },
        });
        toast.success('Successfully added to your wallet!');
      } else {
        toast.error('No Ethereum provider found. Please install a wallet like MetaMask.');
      }
    } catch (e: any) {
      const friendlyError = parseWalletError(e);
      const lowerFriendlyError = friendlyError.toLowerCase();
      // Suppress noisy wallet_watchAsset console errors in Playwright tests
      if (
        lowerFriendlyError.includes('syncing the newly minted token') ||
        lowerFriendlyError.includes('selected account') ||
        lowerFriendlyError.includes('ownership details do not match')
      ) {
        console.warn('Could not add to wallet (ownership mismatch or sync pending).', e && e.message ? e.message : e);
      } else {
        console.error('Failed to add to wallet:', e && e.message ? e.message : e);
      }
      toast.error('Could not add to wallet', { description: friendlyError });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button 
      variant="default" 
      className="w-full bg-gradient-to-r from-purple-500 to-primary text-white" 
      onClick={addToWallet}
      disabled={isAdding}
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      {isAdding ? "Adding..." : "Add to Wallet (MetaMask)"}
    </Button>
  );
}
