"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, Copy, ExternalLink, LogOut } from "lucide-react";
import { useSiwe } from "@/hooks/useSiwe";
import { toast } from "sonner";

export function WalletConnect() {
  const { session, isConnecting, isDisconnecting, connectWallet, disconnectWallet, isConnected, address } = useSiwe();

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  const openEtherscan = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, "_blank");
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
      >
        {isConnecting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-emerald-400/30 text-emerald-300">
          <Avatar className="mr-2 h-6 w-6">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 text-xs">
              {address?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-slate-800/90 backdrop-blur-xl border border-white/10" align="end">
        <div className="p-3">
          <div className="flex items-center gap-3 mb-2">
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900">
                {address?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-white">{session?.user?.name}</div>
              <div className="text-xs text-slate-400">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
            Connected
          </Badge>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={copyAddress} className="text-slate-300 focus:bg-white/10 focus:text-white">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openEtherscan} className="text-slate-300 focus:bg-white/10 focus:text-white">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Etherscan
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={disconnectWallet}
          disabled={isDisconnecting}
          className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}