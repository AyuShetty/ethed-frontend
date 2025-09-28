"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Settings,
  User,
  Wallet,
  BookOpen,
  Menu,
  X
} from "lucide-react";
import { useSignOut } from "@/hooks/use-signout";

export default function Navbar() {
  const { data: session, status } = useSession();
  const signOut = useSignOut();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = () => {
    router.push("/login");
  };

  const getUserDisplayName = () => {
    if (!session?.user) return "User";

    if (session.address) {
      // Wallet user - show formatted address
      return `${session.address.slice(0, 6)}...${session.address.slice(-4)}`;
    }

    return session.user.name || session.user.email || "User";
  };

  const getUserAvatar = () => {
    if (session?.user?.image) {
      return session.user.image;
    }

    // Fallback to Vercel avatar
    const identifier = session?.user?.email || session?.address || "default";
    return `https://avatar.vercel.sh/${encodeURIComponent(identifier)}`;
  };

  const getInitials = () => {
    if (!session?.user) return "U";

    if (session.address) {
      return session.address.slice(2, 4).toUpperCase();
    }

    const name = session.user.name || session.user.email || "User";
    return name.charAt(0).toUpperCase();
  };

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-1" />
            <div className="h-8 w-32 bg-slate-300 rounded animate-pulse" />
            <div className="flex-1 flex justify-end">
              <div className="h-8 w-20 bg-slate-300 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="relative flex h-16 items-center">
          
          {/* Left Section - Navigation Links */}
          <div className="absolute left-0 flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/courses" 
                className="text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-all duration-200 hover:scale-105"
              >
                Courses
              </Link>
              <Link 
                href="/learn" 
                className="text-sm font-medium text-muted-foreground hover:text-cyan-600 transition-all duration-200 hover:scale-105"
              >
                Learn
              </Link>
              <Link 
                href="/how-it-works" 
                className="text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-all duration-200 hover:scale-105"
              >
                How It Works
              </Link>
              <Link 
                href="/community" 
                className="text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-all duration-200 hover:scale-105"
              >
                Community
              </Link>
            </div>
          </div>

          {/* Center Logo - Absolutely positioned for perfect centering */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="group relative block">
              <div className="relative overflow-hidden rounded-xl">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md scale-110" />
                
                {/* Logo with hover effects */}
                <Image
                  src="/logos/logo.png"
                  alt="EthEd Logo"
                  height={32}
                  width={128}
                  className="h-8 mx-auto invert"
                />
                
                {/* Animated border on hover */}
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-gradient-to-r group-hover:from-emerald-400/50 group-hover:via-cyan-400/50 group-hover:to-emerald-400/50 transition-all duration-300">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/10 via-cyan-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </div>
              </div>
              
              {/* Optional: Floating particles effect */}
              <div className="absolute -top-2 -right-2 w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300" />
              <div className="absolute -bottom-2 -left-2 w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500" />
            </Link>
          </div>

          {/* Right Section - Auth */}
          <div className="absolute right-0 flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-8 w-20 bg-slate-300 rounded animate-pulse" />
            ) : session ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full group">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-110 blur-sm" />
                        <Avatar className="h-8 w-8 relative z-10 transition-all duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-emerald-400/50">
                          <AvatarImage src={getUserAvatar()} alt={getUserDisplayName()} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-white">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {getUserDisplayName()}
                          </p>
                          {session.address ? (
                            <div className="flex items-center space-x-1">
                              <Wallet className="h-3 w-3 text-emerald-600" />
                              <p className="text-xs leading-none text-muted-foreground">
                                Wallet Connected
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs leading-none text-muted-foreground">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push("/profile")} className="hover:bg-emerald-50/50">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/dashboard")} className="hover:bg-cyan-50/50">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/settings")} className="hover:bg-emerald-50/50">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={signOut}
                        className="text-red-600 focus:text-red-600 hover:bg-red-50/50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="relative group"
                  >
                    <div className="absolute inset-0 rounded bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                    {isMobileMenuOpen ? 
                      <X className="h-4 w-4 relative z-10 transition-transform duration-200 group-hover:rotate-90" /> : 
                      <Menu className="h-4 w-4 relative z-10 transition-transform duration-200 group-hover:scale-110" />
                    }
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={handleSignIn} 
                  size="sm"
                  className="hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 hover:scale-105"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignIn} 
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu with animations */}
      {isMobileMenuOpen && session && (
        <div className="md:hidden border-t border-slate-200/20 bg-background/95 backdrop-blur animate-in slide-in-from-top-2 duration-200">
          <div className="container py-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-200/20">
              <Avatar className="h-10 w-10 ring-2 ring-emerald-400/20">
                <AvatarImage src={getUserAvatar()} alt={getUserDisplayName()} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                {session.address ? (
                  <div className="flex items-center space-x-1">
                    <Wallet className="h-3 w-3 text-emerald-600" />
                    <p className="text-xs text-muted-foreground">Wallet Connected</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <Link 
                href="/courses" 
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link 
                href="/learn" 
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-cyan-600 hover:bg-cyan-50/50 rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Learn
              </Link>
              <Link 
                href="/how-it-works" 
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="/community" 
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Community
              </Link>
            </div>

            {/* User Menu Items */}
            <div className="space-y-2 pt-4 border-t border-slate-200/20">
              <button
                onClick={() => {
                  router.push("/profile");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-emerald-50/50 rounded-lg transition-all duration-200"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  router.push("/dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-cyan-50/50 rounded-lg transition-all duration-200"
              >
                <BookOpen className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  router.push("/settings");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-emerald-50/50 rounded-lg transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
