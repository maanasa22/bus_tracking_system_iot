import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default async function DriverLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  // Allow only drivers and SUPERADMIN
  if (session.user.role !== "DRIVER" && session.user.role !== "SUPERADMIN") {
    redirect("/"); // Or a generic unauthorized page
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-50 flex flex-col">
      {/* Top Navbar for Driver Interface */}
      <header className="bg-[#111827] border-b border-[#1e293b] p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex flex-col items-center justify-center text-primary font-bold shadow-inner">
             {session.user.name?.charAt(0) || 'D'}
          </div>
          <div>
            <h2 className="font-bold text-white text-sm leading-tight">{getGreeting()}, {session.user.name?.split(' ')[0]}</h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest leading-tight">Driver Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <form action={async () => {
             "use server";
             const { signOut } = await import("@/lib/auth");
             await signOut();
           }}>
             <button className="text-xs font-bold text-danger hover:underline">
               Logout
             </button>
           </form>
        </div>
      </header>
      
      {/* Main Content Area - Mobile Optimized */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
