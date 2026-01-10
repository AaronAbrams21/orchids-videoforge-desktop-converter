"use client";

import { useState } from "react";
import { 
  Moon, 
  Sun, 
  Monitor, 
  Globe, 
  Database, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  HardDrive,
  Cpu,
  Trash2
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});

  const models = [
    { id: "tiny", name: "Whisper Tiny", size: "75 MB", desc: "Fastest, lowest accuracy. Good for quick tests.", downloaded: true },
    { id: "base", name: "Whisper Base", size: "145 MB", desc: "Balanced speed and accuracy. Recommended.", downloaded: false },
    { id: "small", name: "Whisper Small", size: "480 MB", desc: "High accuracy, slower processing.", downloaded: false },
  ];

  const handleDownload = (id: string) => {
    setDownloading(prev => ({ ...prev, [id]: true }));
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setDownloadProgress(prev => ({ ...prev, [id]: prog }));
      if (prog >= 100) {
        clearInterval(interval);
        setDownloading(prev => ({ ...prev, [id]: false }));
      }
    }, 100);
  };

  return (
    <div className="p-12 max-w-5xl mx-auto space-y-16">
      <header>
        <h1 className="text-5xl font-black tracking-tight mb-2">Settings</h1>
        <p className="text-zinc-500 font-medium">Configure your workspace and manage local AI models.</p>
      </header>

      {/* Appearance */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
            <Sun className="w-5 h-5 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold">Appearance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: "light", icon: Sun, label: "Light" },
            { id: "dark", icon: Moon, label: "Dark" },
            { id: "system", icon: Monitor, label: "System" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTheme(item.id)}
              className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 ${
                theme === item.id 
                  ? "border-pink-500 bg-pink-50/50 dark:bg-pink-500/10" 
                  : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200"
              }`}
            >
              <item.icon className={`w-8 h-8 ${theme === item.id ? "text-pink-500" : "text-zinc-400"}`} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Language */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold">Language</h2>
        </div>

        <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <select className="w-full bg-transparent text-xl font-bold outline-none cursor-pointer">
            <option>English (United States)</option>
            <option>Spanish (Español)</option>
            <option>French (Français)</option>
            <option>German (Deutsch)</option>
          </select>
        </div>
      </section>

      {/* Model Management */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold">Model Management</h2>
        </div>

        <div className="grid gap-6">
          {models.map((model) => (
            <div 
              key={model.id}
              className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black">{model.name}</h3>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-widest">
                    {model.size}
                  </span>
                </div>
                <p className="text-zinc-500 font-medium">{model.desc}</p>
              </div>

              <div className="flex items-center gap-4">
                {model.downloaded ? (
                  <>
                    <div className="flex items-center gap-2 text-green-500 font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                      Ready
                    </div>
                    <button className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleDownload(model.id)}
                    disabled={downloading[model.id]}
                    className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {downloading[model.id] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                        {downloadProgress[model.id]}%
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced */}
      <section className="space-y-8 pb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
            <Cpu className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold">Hardware Acceleration</h2>
        </div>

        <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">GPU Acceleration</p>
              <p className="text-zinc-500 text-sm">Use WebGPU/CUDA for faster transcription and conversion.</p>
            </div>
            <div className="w-12 h-6 bg-pink-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4 text-zinc-400 text-sm italic font-medium">
            <AlertCircle className="w-4 h-4" />
            Restart required to apply hardware changes.
          </div>
        </div>
      </section>
    </div>
  );
}
