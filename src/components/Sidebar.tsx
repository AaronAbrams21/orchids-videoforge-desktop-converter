"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Scissors, 
  FileAudio, 
  Settings, 
  Layers,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const menuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Scissors, label: "Convert & Crop", href: "/convert" },
  { icon: FileAudio, label: "Transcribe", href: "/transcribe" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 h-screen bg-white/70 backdrop-blur-xl border-r border-zinc-100 flex flex-col p-6 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-[#1A1A1A] rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
          <Zap className="text-white w-6 h-6 fill-white" />
        </div>
        <span className="font-black text-2xl tracking-tighter">Convrt</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "bg-[#1A1A1A] text-white shadow-xl shadow-black/5" 
                  : "hover:bg-zinc-50 text-zinc-400 hover:text-black"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-white")} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[#1A1A1A]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-white/50 relative z-10" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="p-6 rounded-[32px] bg-zinc-50 border border-zinc-100">
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-zinc-500">Local Engine Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
