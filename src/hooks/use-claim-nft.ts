'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getBlockchainErrorInfo } from '@/lib/blockchain-errors';
import { getExplorerTxUrl } from '@/lib/contracts';
import { switchToChain, getWalletChainId, getActiveWalletAddress, parseWalletError } from '@/lib/wallet-client';
import { AMOY_CHAIN_ID } from '@/lib/contracts';

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
      const activeWalletAddress = await getActiveWalletAddress();
      console.log('=== Claim NFT Hook Debug ===');
      console.log('activeWalletAddress:', activeWalletAddress);

      const res = await fetch('/api/user/course/claim-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug,
          userAddress: activeWalletAddress || undefined,
        })
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
            action: {
              label: 'Add to Wallet',
              onClick: async () => {
                try {
                  if (typeof window !== 'undefined' && (window as any).ethereum && nft?.contractAddress && nft?.tokenId) {
                    const targetChainId = nft.chainId || AMOY_CHAIN_ID;
                    const currentChainId = await getWalletChainId();
                    const activeAddress = await getActiveWalletAddress();

                    if (activeAddress && nft.ownerAddress && activeAddress.toLowerCase() !== nft.ownerAddress.toLowerCase()) {
                      toast.error('Active wallet does not own this NFT', {
                        description: `Switch MetaMask to ${nft.ownerAddress.slice(0, 6)}...${nft.ownerAddress.slice(-4)} before adding Token #${nft.tokenId}.`,
                      });
                      return;
                    }
                    
                    if (currentChainId !== targetChainId) {
                      try {
                        await switchToChain(targetChainId);
                      } catch (switchError) {
                        console.error('Failed to switch chain:', switchError);
                        toast.error('Please switch your wallet to Polygon before adding the NFT.');
                        return;
                      }
                    }

                    await (window as any).ethereum.request({
                      method: 'wallet_watchAsset',
                      params: {
                        type: 'ERC721',
                        options: {
                          address: nft.contractAddress,
                          tokenId: nft.tokenId,
                        },
                      },
                    });
                    toast.success('Added to wallet successfully!');
                  } else {
                    toast.error('No supported wallet found or NFT details missing.');
                  }
                } catch (e: any) {
                  const friendlyError = parseWalletError(e);
                  toast.error('Could not add to wallet', { description: friendlyError });
                }
              },
            },
            cancel: explorerUrl ? {
              label: 'View Explorer',
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

  const addToWallet = async () => {
    if (!claimResult?.nft?.contractAddress || !claimResult?.nft?.tokenId) {
      toast.error('NFT details missing or not on-chain yet.');
      return;
    }
    
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const targetChainId = claimResult.nft.chainId || AMOY_CHAIN_ID;
        const currentChainId = await getWalletChainId();
        const activeAddress = await getActiveWalletAddress();

        if (
          activeAddress &&
          claimResult.nft.ownerAddress &&
          activeAddress.toLowerCase() !== claimResult.nft.ownerAddress.toLowerCase()
        ) {
          toast.error('Active wallet does not own this NFT', {
            description: `Switch MetaMask to ${claimResult.nft.ownerAddress.slice(0, 6)}...${claimResult.nft.ownerAddress.slice(-4)} before adding Token #${claimResult.nft.tokenId}.`,
          });
          return;
        }
        
        if (currentChainId !== targetChainId) {
          try {
            await switchToChain(targetChainId);
          } catch (switchError) {
            console.error('Failed to switch chain:', switchError);
            toast.error('Please switch your wallet to Polygon before adding the NFT.');
            return;
          }
        }

        await (window as any).ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC721',
            options: {
              address: claimResult.nft.contractAddress,
              tokenId: claimResult.nft.tokenId,
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
      // Suppress noisy wallet_watchAsset console errors in tests
      if (
        lowerFriendlyError.includes('syncing the newly minted token') ||
        lowerFriendlyError.includes('selected wallet account does not own this nft') ||
        lowerFriendlyError.includes('ownership details do not match')
      ) {
        console.warn('Could not add to wallet (ownership mismatch or sync pending).', e && e.message ? e.message : e);
      } else {
        console.error('Failed to add to wallet:', e && e.message ? e.message : e);
      }
      toast.error('Could not add to wallet', { description: friendlyError });
    }
  };

  return { claimNFT, isClaiming, claimed, claimResult, addToWallet };
}
