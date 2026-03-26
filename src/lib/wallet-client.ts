import { AMOY_CHAIN_ID, getChainConfig } from "@/lib/contracts";

export async function getWalletChainId(): Promise<number | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  const chainIdHex = (await window.ethereum.request({
    method: "eth_chainId",
  })) as string;

  return parseInt(chainIdHex, 16);
}

export async function getActiveWalletAddress(): Promise<string | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    console.warn('getActiveWalletAddress: No window.ethereum');
    return null;
  }

  try {
    const accounts = (await window.ethereum.request({
      method: "eth_accounts",
    })) as string[];

    console.log('[DEBUG] eth_accounts returned:', accounts);
    const activeAccount = accounts?.[0] ?? null;
    console.log('[DEBUG] getActiveWalletAddress returning:', activeAccount);
    return activeAccount;
  } catch (error) {
    console.error('[ERROR] getActiveWalletAddress failed:', error);
    return null;
  }
}

export async function switchToChain(targetChainId: number): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet detected");
  }

  const chainConfig = getChainConfig(targetChainId);

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainConfig.hexChainId }],
    });
  } catch (error: unknown) {
    if ((error as { code?: number })?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainConfig.hexChainId,
            chainName: chainConfig.name,
            rpcUrls: chainConfig.rpcUrls,
            blockExplorerUrls: chainConfig.blockExplorerUrls,
            nativeCurrency: chainConfig.nativeCurrency,
          },
        ],
      });
      return;
    }

    throw error;
  }
}

export async function ensurePolygonChain(): Promise<number | null> {
  const currentChainId = await getWalletChainId();

  if (currentChainId === null) {
    return null;
  }

  if (currentChainId !== AMOY_CHAIN_ID) {
    await switchToChain(AMOY_CHAIN_ID);
  }

  return AMOY_CHAIN_ID;
}

export const ensureAmoyChain = ensurePolygonChain;

export function parseWalletError(e: any): string {
  let msg = 'Failed to interact with wallet';
  if (typeof e === 'string') msg = e;
  else if (e?.message) msg = e.message;
  else if (e?.data?.message) msg = e.data.message;

  const lowerMsg = msg.toLowerCase();
  if (
    lowerMsg.includes('suggested nft is not owned by the selected account') ||
    lowerMsg.includes('ownership details do not match')
  ) {
    return 'Selected wallet account does not own this NFT. Switch MetaMask to the certificate owner account, then try again.';
  }
  if (lowerMsg.includes('verify ownership') || lowerMsg.includes('standard is not supported')) {
    return "Wallet could not verify ownership. The network may still be syncing the newly minted token, or your active wallet account might not match the certificate owner. Please check your active account and try again in a few moments.";
  }
  
  return msg;
}
