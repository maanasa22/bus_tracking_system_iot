"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/actions/auth";
import { Bus, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <div className="min-h-screen flex w-full bg-[#0a0e1a] overflow-hidden">
      {/* Left side - Branding & Illustration */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">Tracy<span className="text-primary">G</span></span>
            <span className="px-2 py-1 ml-2 rounded text-[10px] font-bold bg-white/10 text-white uppercase tracking-wider">Enterprise</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            Intelligent Fleet <br/> & Transit Management
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mb-12 leading-relaxed">
            Real-time IoT bus tracking platform designed for educational institutions to ensure safety and efficiency.
          </p>
          
          {/* Simple feature list */}
          <div className="space-y-4">
            {[
              "Real-time GPS tracking with sub-second latency",
              "AI-powered ETA predictions and scheduling",
              "Comprehensive driver and student management"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                </div>
                <span className="text-sm font-medium text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10 bg-[#0c1222] border-l border-border/50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-10">
            {/* Mobile logo */}
            <div className="flex lg:hidden justify-center items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Bus className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">TracyG</span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground text-sm">Enter your credentials to access the portal</p>
          </div>

          <form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="input pl-10 h-12 text-base transition-all bg-[#0f172a] border-[#1e293b]"
                  defaultValue="admin@tracyg.in"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input pl-10 h-12 text-base transition-all bg-[#0f172a] border-[#1e293b]"
                  defaultValue="admin123"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 text-base btn-primary justify-center mt-2 group shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              {isPending ? "Authenticating..." : "Sign In"}
              {!isPending && (
                <span className="group-hover:translate-x-1 transition-transform inline-block ml-1">→</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border flex flex-col gap-3">
            <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider mb-2">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  (document.getElementById('email') as HTMLInputElement).value = 'venkateshr@tracyg.in';
                  (document.getElementById('password') as HTMLInputElement).value = 'driver123';
                }}
                className="btn-ghost text-xs justify-center py-2 h-auto"
              >
                Fill Driver
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  (document.getElementById('email') as HTMLInputElement).value = 'arjunm.std@jgi.edu';
                  (document.getElementById('password') as HTMLInputElement).value = 'student123';
                }}
                className="btn-ghost text-xs justify-center py-2 h-auto"
              >
                Fill Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
