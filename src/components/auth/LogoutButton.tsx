"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  className?: string;
  variant?: 'icon' | 'full';
  children?: React.ReactNode;
}

export function LogoutButton({ className, variant = 'full', children }: LogoutButtonProps) {
  const handleSignOut = async () => {
    // redirect: false prevents Auth.js from doing a server-side redirect to a potentially incorrect 0.0.0.0 hostname
    // We handle the navigation manually on the client after the session token is cleared
    await signOut({ redirect: false });
    window.location.href = "/auth/login";
  };

  if (variant === 'icon') {
    return (
      <button 
        onClick={handleSignOut}
        className={className || "p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors ml-1"}
        title="Sign out"
      >
        {children || <LogOut className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button 
      onClick={handleSignOut} 
      className={className || "w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#111827] text-danger font-bold hover:bg-danger/10 transition-colors"}
    >
      {children || (
        <>
          <LogOut className="h-5 w-5" />
          Sign Out
        </>
      )}
    </button>
  );
}
