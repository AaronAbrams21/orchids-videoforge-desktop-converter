"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Scissors, 
  FileType, 
  ArrowRight,
  Download,
  Loader2,
  X,
  Clock,
  ChevronDown,
  Monitor,
  Smartphone,
  Square,
  RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import heavy processing logic to avoid build/SSR issues
const VideoProcessor = dynamic(() => import("@/components/VideoProcessor"), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[48px] border border-zinc-100 shadow-sm">
      <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
      <p className="font-bold text-zinc-400">Loading Local Engine...</p>
    </div>
  )
});

export default function ConvertPage() {
  return (
    <div className="p-12 max-w-7xl">
      <header className="mb-16">
        <h1 className="text-6xl font-black tracking-tight mb-4">Convert & Crop</h1>
        <p className="text-zinc-400 text-xl font-medium">Professional grade video tools, running entirely in your browser.</p>
      </header>

      <VideoProcessor />
    </div>
  );
}
