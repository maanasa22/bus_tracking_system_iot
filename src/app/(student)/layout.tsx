import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bus, UserCircle } from "lucide-react";
import Link from "next/link";
import { StudentBottomNav } from "./StudentBottomNav";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  // Allow only students and SUPERADMIN
  if (session.user.role !== "STUDENT" && session.user.role !== "SUPERADMIN") {
    redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col font-sans">
      <main className="flex-1 flex flex-col pb-20">
        {children}
      </main>

      {/* Floating Bottom App Bar for Students/Parents */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] pb-safe z-50">
        <div className="flex justify-around items-center p-3">
           <Link href="/student" className="flex flex-col items-center gap-1 text-primary">
             <Bus className="h-6 w-6" />
             <span className="text-[10px] font-bold tracking-wide">Track</span>
           </Link>
           <StudentBottomNav />
           <form action={async () => {
             "use server";
             const { signOut } = await import("@/lib/auth");
             await signOut();
           }}>
             <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-danger transition-colors">
               <UserCircle className="h-6 w-6" />
               <span className="text-[10px] font-bold tracking-wide">Logout</span>
             </button>
           </form>
        </div>
      </nav>
    </div>
  );
}
