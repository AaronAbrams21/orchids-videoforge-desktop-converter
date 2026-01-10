"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Moon, 
  Sun, 
  Monitor, 
  Languages, 
  Cpu, 
  Download, 
  CheckCircle2,
  Trash2,
  Settings as SettingsIcon,
  Palette,
  HardDrive
} from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState("English");
  const [models, setModels] = useState([
    { id: "whisper-tiny", name: "Whisper Tiny", size: "75 MB", status: "downloaded" },
    { id: "whisper-base", name: "Whisper Base", size: "145 MB", status: "not_downloaded" },
    { id: "whisper-small", name: "Whisper Small", size: "480 MB", status: "not_downloaded" },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-12 max-w-5xl">
      <header className="mb-16">
        <h1 className="text-6xl font-black tracking-tight mb-4">Settings</h1>
        <p className="text-zinc-400 text-xl font-medium">Configure your studio environment and local AI models.</p>
      </header>

      <section className="space-y-12">
        {/* Theme Customization */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Palette className="w-6 h-6 text-pink-500" />
            <h2 className="text-2xl font-black">Customization</h2>
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
                    ? "border-pink-500 bg-pink-50/50" 
                    : "border-zinc-100 bg-white hover:border-zinc-200"
                }`}
              >
                <item.icon className={`w-8 h-8 ${theme === item.id ? "text-pink-500" : "text-zinc-400"}`} />
                <span className="font-bold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="p-10 rounded-[48px] bg-white border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Languages className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-black">Language</h2>
            </div>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Japanese</option>
          </select>
        </div>

        {/* Model Management */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <HardDrive className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-black">Model Management</h2>
          </div>
          <div className="space-y-4">
            {models.map((model) => (
              <div 
                key={model.id}
                className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    model.status === "downloaded" ? "bg-green-50" : "bg-zinc-50"
                  }`}>
                    {model.status === "downloaded" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Cpu className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{model.name}</h3>
                    <p className="text-zinc-400 font-medium text-sm">{model.size}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {model.status === "downloaded" ? (
                    <button className="p-3 text-zinc-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <button className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Acceleration */}
        <div className="p-10 rounded-[48px] bg-[#1A1A1A] text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Hardware Acceleration</h2>
                <p className="text-white/50 text-sm font-medium">Use GPU for faster processing (WebGPU/WASM)</p>
              </div>
            </div>
            <div className="w-16 h-8 bg-pink-500 rounded-full flex items-center px-1">
              <div className="w-6 h-6 bg-white rounded-full ml-auto" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
