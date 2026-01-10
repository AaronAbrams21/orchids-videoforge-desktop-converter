"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Scissors, 
  ArrowRight,
  Download,
  Loader2,
  X,
  Plus,
  ChevronDown,
  Settings2,
  Video
} from "lucide-react";
import dynamic from "next/dynamic";

// FFmpeg is loaded dynamically to avoid Turbopack build issues with WASM/Workers
const FFmpegWrapper = dynamic(() => import("@/components/FFmpegProcessor"), { ssr: false });

export default function ConvertPage() {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <header className="mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-4">Video Converter</h1>
        <p className="text-xl text-zinc-500 font-medium">Smart cropping and high-speed conversion, entirely local.</p>
      </header>

      <main className="max-w-6xl">
        {!file ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-pink-100/20 blur-3xl group-hover:bg-pink-100/40 transition-colors rounded-[64px]" />
            <div 
              className="relative aspect-video lg:aspect-[21/9] border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[64px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-pink-300 dark:hover:border-pink-900 transition-all bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-pink-500" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black mb-2">Drop your video here</p>
                <p className="text-zinc-400 font-bold">MP4, MOV, WEBM up to 2GB</p>
              </div>
              <input 
                id="file-upload"
                type="file" 
                className="hidden" 
                accept="video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
            </div>
          </motion.div>
        ) : (
          <FFmpegWrapper file={file} onCancel={() => setFile(null)} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            { title: "Smart Crop", desc: "Auto-detect subjects and crop for TikTok or Instagram.", icon: Scissors },
            { title: "4K Support", desc: "Process high-resolution video without quality loss.", icon: Video },
            { title: "Privacy", desc: "No data ever leaves your machine. 100% secure.", icon: Settings2 },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
