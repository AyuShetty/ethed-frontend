"use client";
import { useState } from "react";
import { User, LogIn, LogOut } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 w-full border-b border-emerald-400/20 bg-black/90 backdrop-blur-md shadow-lg">
      {/* Tagline */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 text-center font-mono font-semibold text-xs tracking-wide text-cyan-200 py-2 border-b border-emerald-400/20">
        Learn on-chain. Grow your chain of knowledge.
      </div>

      {/* Main Navbar */}
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left Menu */}
        <div className="flex space-x-6 font-medium text-sm text-slate-200">
          <a href="#" className="hover:text-emerald-400 transition">Explore</a>
          <a href="#" className="hover:text-emerald-400 transition">How It Works</a>
          <a href="#" className="hover:text-emerald-400 transition">Milestones</a>
        </div>

        {/* Center Logo */}
        <div>
          <Image
            src="/logos/logo.png"
            alt="EthEd Logo"
            height={32}
            width={128}
            className="h-8 mx-auto invert" // invert logo so black logos turn white
          />
        </div>

        {/* Right Menu */}
        <div className="flex space-x-6 font-medium text-sm items-center relative text-slate-200">
          <a href="#" className="hover:text-emerald-400 transition">About</a>
          <a href="#" className="hover:text-emerald-400 transition">Start Learning</a>

          {/* User/Login Section */}
          <div className="relative">
            {isLoggedIn ? (
              <div
                className="flex items-center space-x-2 cursor-pointer hover:text-emerald-400 transition"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </div>
            ) : (
              <button
                onClick={() => setIsLoggedIn(true)}
                className="flex items-center space-x-2 px-3 py-1.5 border border-emerald-400/40 rounded-full hover:bg-emerald-400/10 hover:text-emerald-300 transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-emerald-400/30 shadow-xl rounded-lg overflow-hidden">
                <a
                  href="#"
                  className="block px-4 py-2 text-slate-200 hover:bg-emerald-400/10 hover:text-emerald-300 transition"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-slate-200 hover:bg-emerald-400/10 hover:text-emerald-300 transition"
                >
                  Settings
                </a>
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center space-x-2 text-slate-200 hover:bg-emerald-400/10 hover:text-emerald-300 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
