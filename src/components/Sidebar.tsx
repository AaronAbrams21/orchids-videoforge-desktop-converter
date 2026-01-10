"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Scissors, 
  FileAudio, 
  Settings, 
  Zap,
  LayoutDashboard,
  Github
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const menuItems = [
  { icon: LayoutDashboard, label: "Converter", href: "/" },
  { icon: FileAudio, label: "Transcriber", href: "/transcribe" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
          <Zap className="text-white dark:text-black w-6 h-6" />
        </div>
        <span className="font-black text-xl tracking-tight">Convrt</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group",
                isActive 
                  ? "text-black dark:text-white bg-zinc-100 dark:bg-zinc-900" 
                  : "text-zinc-500 hover:text-black dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-pink-500 rounded-r-full"
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-pink-500" : "group-hover:text-pink-500"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="p-6 rounded-[32px] bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl shadow-pink-500/20">
          <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">Local AI</p>
          <p className="text-sm font-bold leading-snug">
            All processing happens on your device.
          </p>
        </div>
        
        <div className="mt-6 flex items-center justify-between px-2 opacity-40 hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-black uppercase tracking-widest">v0.1.0 Alpha</span>
          <Github className="w-4 h-4 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
