"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Scissors, 
  FileAudio, 
  Settings, 
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "Home", href: "/", icon: Home },
  { name: "Convert", href: "/convert", icon: Scissors },
  { name: "Transcribe", href: "/transcribe", icon: FileAudio },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-80 border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col sticky top-0 h-screen">
      <div className="p-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
            <LayoutDashboard className="text-white dark:text-black w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight">Convrt</span>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Workspace</p>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-6 py-4 rounded-[24px] font-bold transition-all",
              pathname === item.href
                ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white"
                : "text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            )}
          >
            <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-pink-500" : "text-current")} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-8">
        <div className="p-6 rounded-[32px] bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20">
          <div className="flex items-center gap-2 text-pink-500 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Secure</span>
          </div>
          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed">
            All processing happens locally on your machine.
          </p>
        </div>
      </div>
    </aside>
  );
}
