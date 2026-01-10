"use client";

import { useState, useRef, useEffect } from "react";
import { 
  FileAudio, 
  Loader2,
  X,
  Play,
  Download,
  Copy,
  Check,
  Languages,
  Zap,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const TranscriptionProcessor = dynamic(() => import("@/components/TranscriptionProcessor"), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[48px] border border-zinc-100 shadow-sm">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p className="font-bold text-zinc-400">Loading AI Engine...</p>
    </div>
  )
});

export default function TranscribePage() {
  return (
    <div className="p-12 max-w-7xl">
      <header className="mb-16">
        <h1 className="text-6xl font-black tracking-tight mb-4">AI Transcriber</h1>
        <p className="text-zinc-400 text-xl font-medium">World-class speech-to-text using local Whisper models. Your audio never leaves your device.</p>
      </header>

      <TranscriptionProcessor />
    </div>
  );
}
