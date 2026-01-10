"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  FileAudio, 
  Settings2,
  Mic,
  Brain,
  ShieldCheck
} from "lucide-react";
import dynamic from "next/dynamic";

const WhisperTranscriber = dynamic(() => import("@/components/WhisperTranscriber"), { ssr: false });

export default function TranscribePage() {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <header className="mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-4">AI Transcriber</h1>
        <p className="text-xl text-zinc-500 font-medium">Whisper-powered speech-to-text, 100% local and private.</p>
      </header>

      <main className="max-w-6xl">
        {!file ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-blue-100/20 blur-3xl group-hover:bg-blue-100/40 transition-colors rounded-[64px]" />
            <div 
              className="relative aspect-video lg:aspect-[21/9] border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[64px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-900 transition-all bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm"
              onClick={() => document.getElementById("audio-upload")?.click()}
            >
              <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Mic className="w-10 h-10 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black mb-2">Drop your audio or video</p>
                <p className="text-zinc-400 font-bold">MP3, WAV, MP4 up to 500MB</p>
              </div>
              <input 
                id="audio-upload"
                type="file" 
                className="hidden" 
                accept="audio/*,video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
            </div>
          </motion.div>
        ) : (
          <WhisperTranscriber file={file} onCancel={() => setFile(null)} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            { title: "Whisper AI", desc: "State-of-the-art speech recognition by OpenAI, running locally.", icon: Brain, color: "text-blue-500" },
            { title: "SRT Export", desc: "Generate perfectly timed subtitles for your videos.", icon: FileAudio, color: "text-pink-500" },
            { title: "No Clouds", desc: "Your voice never leaves your computer. Period.", icon: ShieldCheck, color: "text-green-500" },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
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
