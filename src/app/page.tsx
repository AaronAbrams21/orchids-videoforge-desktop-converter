"use client";

import Link from "next/link";
import { 
  Scissors, 
  FileAudio, 
  Settings, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Cpu
} from "lucide-react";

export default function Home() {
  return (
    <div className="p-12 max-w-7xl mx-auto space-y-16 pb-24">
      {/* Hero Section */}
      <header className="space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-xs font-black uppercase tracking-widest">
          <Zap className="w-3 h-3 fill-current" />
          V2.0 Now with Whisper AI
        </div>
        <h1 className="text-8xl font-black leading-[0.95] tracking-tight">
          Local Studio.<br />
          <span className="text-zinc-400">Zero Cloud.</span>
        </h1>
        <p className="text-2xl text-zinc-500 font-medium leading-relaxed max-w-2xl">
          Professional video conversion, cropping, and AI transcription that runs entirely on your machine. Private by design.
        </p>
      </header>

      {/* Main Tools Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link 
          href="/convert"
          className="group relative p-10 rounded-[56px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-pink-500 transition-all overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Scissors className="w-48 h-48 -rotate-12" />
          </div>
          <div className="relative space-y-6">
            <div className="w-16 h-16 bg-pink-500 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-pink-200 dark:shadow-none">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black mb-4">Convert & Crop</h2>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed">
                Reformat videos for TikTok, Instagram, and YouTube. Fast, local conversion with high-quality output.
              </p>
            </div>
            <div className="flex items-center gap-3 text-pink-500 font-black pt-4">
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </Link>

        <Link 
          href="/transcribe"
          className="group relative p-10 rounded-[56px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-purple-600 transition-all overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileAudio className="w-48 h-48 rotate-12" />
          </div>
          <div className="relative space-y-6">
            <div className="w-16 h-16 bg-purple-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-purple-200 dark:shadow-none">
              <FileAudio className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black mb-4">AI Transcribe</h2>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed">
                Convert speech to text with Whisper AI. Support for 50+ languages with industry-leading accuracy.
              </p>
            </div>
            <div className="flex items-center gap-3 text-purple-600 font-black pt-4">
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </Link>
      </section>

      {/* Features Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            title: "Private by Design", 
            desc: "Your files never leave your device. All processing happens in-browser or via local sidecars.",
            icon: ShieldCheck,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-500/10"
          },
          { 
            title: "Tauri Native", 
            desc: "Optimized for desktop performance. Uses system resources efficiently for heavy tasks.",
            icon: Cpu,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-500/10"
          },
          { 
            title: "Offline Ready", 
            desc: "Download models once and work without an internet connection. Anywhere, anytime.",
            icon: Globe,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-500/10"
          }
        ].map((feature, i) => (
          <div key={i} className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-50 dark:border-zinc-800/50">
            <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center ${feature.color} mb-6`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-3">{feature.title}</h3>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
