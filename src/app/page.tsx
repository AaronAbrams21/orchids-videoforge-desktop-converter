"use client";

import { motion } from "framer-motion";
import { 
  Upload, 
  Youtube, 
  Scissors, 
  FileAudio, 
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8F9FB] text-[#1A1A1A]">
      {/* Background Orbs */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-pink-100/40 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[140px]" />

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white shadow-sm mb-10 text-xs font-bold uppercase tracking-widest text-[#FF4181]"
          >
            <span className="w-2 h-2 bg-[#FF4181] rounded-full animate-pulse" />
            V2.0 Now with Whisper AI
          </motion.div>

          <h1 className="text-8xl font-bold leading-[1.05] tracking-tight mb-10">
            Studio Quality <br />
            <span className="text-zinc-400">On Your Desktop.</span>
          </h1>
          
          <p className="text-2xl text-zinc-500 font-medium mb-12 max-w-2xl leading-relaxed">
            The world's most powerful video converter and transcriber. 
            100% private, 100% local, and surprisingly fast.
          </p>

          <div className="flex gap-6 mb-24">
            <Link href="/convert">
              <button className="bg-[#1A1A1A] text-white px-10 py-6 rounded-[32px] text-xl font-black flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/10">
                Start Converting
                <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
            <Link href="/transcribe">
              <button className="bg-white border border-zinc-100 px-10 py-6 rounded-[32px] text-xl font-black hover:bg-zinc-50 transition-all">
                Try Transcriber
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Privacy First", desc: "No uploads. Your data stays on your machine 100% of the time.", icon: Shield, color: "text-pink-500" },
              { title: "Smart Crop", desc: "AI-assisted cropping for social media formats and custom ratios.", icon: Scissors, color: "text-blue-500" },
              { title: "Whisper AI", desc: "World-class transcription with no subscription fees.", icon: FileAudio, color: "text-orange-500" },
            ].map((card, i) => (
              <div key={i} className="p-8 rounded-[40px] bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
                <div className="w-14 h-14 bg-zinc-50 rounded-[20px] flex items-center justify-center mb-6 group-hover:bg-[#1A1A1A] transition-colors">
                  <card.icon className={`w-6 h-6 ${card.color} group-hover:text-white`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="container mx-auto px-6 py-20 border-t border-zinc-100 relative z-10 opacity-30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-black rounded-lg" />
            <span className="font-black">Convrt</span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest">
            SECURE LOCAL-FIRST WASM ARCHITECTURE
          </div>
        </div>
      </footer>
    </div>
  );
}
