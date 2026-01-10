"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor,
  Globe,
  Database,
  Cpu,
  Shield,
  Zap
} from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <header className="mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-4">Settings</h1>
        <p className="text-xl text-zinc-500 font-medium">Customize your studio environment and local AI models.</p>
      </header>

      <main className="max-w-4xl space-y-12">
        {/* Theme Selection */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
              <Sun className="w-6 h-6 text-pink-500" />
              Appearance
            </h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Choose your studio vibe</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`
                  p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group
                  ${theme === item.id 
                    ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20" 
                    : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"}
                `}
              >
                <item.icon className={`w-8 h-8 ${theme === item.id ? "text-pink-500" : "text-zinc-400 group-hover:text-zinc-600"}`} />
                <span className={`font-black ${theme === item.id ? "text-pink-600" : "text-zinc-500"}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Model Management */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-500" />
              AI Model Management
            </h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Configure local inference engines</p>
          </div>

          <div className="space-y-4">
            {[
              { name: "Whisper Base", size: "148MB", status: "Installed", type: "Speech-to-Text" },
              { name: "Whisper Small", size: "484MB", status: "Available", type: "Speech-to-Text (HQ)" },
              { name: "FFmpeg WASM Core", size: "32MB", status: "Installed", type: "Video Processing" },
            ].map((model, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div>
                    <p className="font-black text-lg">{model.name}</p>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{model.type} • {model.size}</p>
                  </div>
                </div>
                <button className={`
                  px-6 py-2.5 rounded-2xl text-sm font-black transition-all
                  ${model.status === "Installed" 
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" 
                    : "bg-blue-500 text-white hover:scale-105 active:scale-95"}
                `}>
                  {model.status}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="p-10 rounded-[48px] bg-gradient-to-br from-[#1A1A1A] to-zinc-800 text-white shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-pink-400" />
            </div>
            <h2 className="text-3xl font-black">Security Vault</h2>
          </div>
          <p className="text-lg font-medium text-zinc-300 leading-relaxed mb-8">
            Convrt is built on a "Local-First" philosophy. Your data, API keys, and models never touch our servers. Processing happens entirely within your device's sandbox.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <p className="text-xs font-black text-pink-400 uppercase tracking-widest mb-1">Network Status</p>
              <p className="font-bold">100% Offline Capable</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <p className="text-xs font-black text-pink-400 uppercase tracking-widest mb-1">Encryption</p>
              <p className="font-bold">End-to-End Local</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
