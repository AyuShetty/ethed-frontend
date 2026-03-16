'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { switchToChain, getWalletChainId, parseWalletError } from '@/lib/wallet-client';
import { AMOY_CHAIN_ID } from '@/lib/contracts';

export default function AddToWalletButton({ contractAddress, tokenId, chainId }: { contractAddress: string; tokenId: string; chainId?: number; }) {
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
      // Suppress noisy wallet_watchAsset console errors in Playwright tests
      if (friendlyError.includes('syncing the newly minted token')) {
        console.warn('Could not add to wallet (ownership sync pending).', e && e.message ? e.message : e);
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
