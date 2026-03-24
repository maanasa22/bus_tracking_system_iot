"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export function Header({ user }: { user: { name?: string | null; role?: string; image?: string | null } }) {
  return (
    <header className="h-16 px-6 border-b border-[#1e293b] bg-[#0a0e1a]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shrink-0">
      
      {/* Search Bar */}
      <div className="hidden md:flex items-center max-w-md w-full relative">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3" />
        <input 
          type="text" 
          placeholder="Search buses, routes, or drivers (Press '/')" 
          className="w-full bg-[#111827] border border-[#1e293b] rounded-full pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-slate-600"
        />
      </div>

      <div className="flex md:hidden items-center">
        {/* Mobile menu button could go here */}
        <span className="font-bold text-lg text-white">Tracy<span className="text-primary">G</span></span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors outline-none rounded-full hover:bg-[#111827]">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-[#0a0e1a]"></span>
        </button>

        <div className="h-6 w-px bg-[#1e293b]"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-white">{user.name || "Admin User"}</span>
            <span className="text-xs text-primary font-medium">{user.role || "ADMIN"}</span>
          </div>
          
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-[#1e293b] shadow-sm select-none">
            {user.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors ml-1"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
