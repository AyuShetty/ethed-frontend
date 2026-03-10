export type BlockchainErrorInfo = {
  title: string;
  description?: string;
  code?: number | string;
  isChainError?: boolean;
  action?: string;
};

export function getBlockchainErrorInfo(error: unknown): BlockchainErrorInfo {
  if (!error) {
    return {
      title: "Blockchain error",
      description: "Something went wrong with your wallet connection.",
      action: "reconnect",
    };
  }

  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "Unknown blockchain error";

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: number | string }).code
      : undefined;

  if (code === 4001) {
    return {
      title: "Request cancelled",
      description: "You rejected the signature request in your wallet. Please try signing again when ready.",
      code,
      action: "retry",
    };
  }

  if (code === 4902) {
    return {
      title: "Polygon network not found",
      description: "Your wallet doesn't have Polygon mainnet configured. We'll try to add it automatically — please approve the network addition in your wallet.",
      code,
      isChainError: true,
      action: "add-network",
    };
  }

  if (code === -32002) {
    return {
      title: "Wallet request pending",
      description: "You have a pending request in your wallet. Please open your wallet extension and complete or dismiss the pending action.",
      code,
      action: "check-wallet",
    };
  }

  if (code === -32603) {
    return {
      title: "Wallet internal error",
      description: "Your wallet encountered an internal error. Try refreshing the page and reconnecting.",
      code,
      action: "refresh",
    };
  }

  if (typeof message === "string") {
    const lower = message.toLowerCase();

    // Wrong network detection
    if (lower.includes("wrong network") || (lower.includes("chain") && (lower.includes("switch") || lower.includes("wrong")))) {
      return {
        title: "Wrong network detected",
        description: "Please switch your wallet to Polygon mainnet to continue. Go to your wallet settings → Networks → Select Polygon (Chain ID: 137).",
        isChainError: true,
        action: "switch-network",
      };
    }

    // Normalize and present common address/formatting errors to users more clearly
    if (lower.includes("eip-55") || lower.includes("checksum") || lower.includes("invalid address")) {
      const isManualEntry = lower.includes("format") || lower.includes("invalid address");
      return {
        title: "Invalid wallet address",
        description: isManualEntry
          ? "The address looks invalid — remove extra spaces or invisible characters, or ensure it starts with `0x`. If you're using a wallet, try clicking **Connect Current Wallet** again."
          : "The wallet returned an invalid address format. Please try disconnecting and reconnecting your wallet.",
        action: "reconnect",
      };
    }

    // Signature / rejection
    if (lower.includes("user rejected") || lower.includes("denied") || lower.includes("user denied")) {
      return {
        title: "Signature request declined",
        description: "You declined the sign-in request. Please try again and approve the signature in your wallet to continue.",
        action: "retry",
      };
    }

    // Session / nonce expiry
    if (lower.includes("nonce") || lower.includes("expired") || lower.includes("session")) {
      return {
        title: "Session expired",
        description: "Your sign-in session has expired. Please try signing in again — a fresh login challenge will be generated.",
        action: "retry",
      };
    }

    // Insufficient funds
    if (lower.includes("insufficient funds") || lower.includes("insufficient balance")) {
      return {
        title: "Insufficient funds",
        description: "Your wallet does not have enough MATIC for gas fees on Polygon mainnet.",
        action: "fund-wallet",
      };
    }

    // Disconnected
    if (lower.includes("disconnected") || lower.includes("provider is disconnected") || lower.includes("lost connection")) {
      return {
        title: "Wallet disconnected",
        description: "The connection to your wallet was lost. Please refresh the page and reconnect your wallet.",
        action: "reconnect",
      };
    }

    // Not connected
    if (lower.includes("not connected") || lower.includes("no provider") || lower.includes("no wallet")) {
      return {
        title: "No wallet detected",
        description: "Please install a Web3 wallet like MetaMask, then refresh this page to connect.",
        action: "install-wallet",
      };
    }

    // Network / RPC errors
    if (lower.includes("network error") || lower.includes("fetch failed") || lower.includes("failed to fetch")) {
      return {
        title: "Network error",
        description: "Could not reach the server. Please check your internet connection and try again.",
        action: "retry",
      };
    }

    // Transaction failed
    if (lower.includes("transaction failed") || lower.includes("execution reverted")) {
      return {
        title: "Transaction failed",
        description: "The blockchain transaction did not succeed. This may be due to a contract error. Please try again.",
        action: "retry",
      };
    }
  }

  return {
    title: "Something went wrong",
    description: typeof message === 'string' && message.length > 0 && message.length < 200
      ? message
      : "An unexpected error occurred. Please refresh the page and try again.",
    code,
    action: "retry",
  };
}
