"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Youtube, 
  Scissors, 
  FileType, 
  ArrowRight,
  Download,
  X,
  ChevronDown,
  Clock,
  Layout,
  RefreshCcw,
  Zap,
  Play
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

const formats = ["mp4", "mov", "avi", "webm", "mp3", "wav"];
const aspectRatios = [
  { label: "Original", value: "original" },
  { label: "16:9 (YouTube)", value: "16:9" },
  { label: "9:16 (TikTok)", value: "9:16" },
  { label: "1:1 (Instagram)", value: "1:1" },
  { label: "4:5 (Portrait)", value: "4:5" },
];

export default function ConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [ytUrl, setYtUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "processing" | "result">("upload");
  
  // Settings
  const [startTime, setStartTime] = useState("00:00:00");
  const [duration, setDuration] = useState("00:00:10");
  const [format, setFormat] = useState("mp4");
  const [aspectRatio, setAspectRatio] = useState("original");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleYtDownload = async () => {
    if (!ytUrl) return;
    setIsProcessing(true);
    setStatus("Fetching video from YouTube...");
    setMode("processing");

    try {
      // Mocked call to Tauri sidecar
      // const videoPath = await invoke<string>("download_youtube_video", { url: ytUrl });
      await new Promise(r => setTimeout(r, 3000));
      setProgress(100);
      setStatus("Download complete!");
      setMode("upload"); // Return to adjust settings
    } catch (err) {
      console.error(err);
      setStatus("Failed to download.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processVideo = async () => {
    setIsProcessing(true);
    setMode("processing");
    setStatus("Encoding video...");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    try {
      // Here we would call the Tauri sidecar for FFmpeg
      await new Promise(r => setTimeout(r, 4000));
      setProgress(100);
      setStatus("Processing complete");
      setOutputUrl("https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4");
      setMode("result");
    } catch (err) {
      console.error(err);
      setStatus("Processing failed");
    } finally {
      setIsProcessing(false);
      clearInterval(interval);
    }
  };

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2">Video Converter</h1>
          <p className="text-zinc-500 font-medium text-lg">Native performance. Zero cloud usage.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="px-4 py-2 bg-pink-50 dark:bg-pink-500/10 rounded-xl text-pink-500 font-black text-xs uppercase tracking-widest">
            Hardware Enabled
          </div>
          <Zap className="w-5 h-5 text-yellow-500 mr-2" />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {mode === "upload" && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-7 space-y-8">
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[400px] border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[64px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-pink-500/50 hover:bg-pink-50/30 dark:hover:bg-pink-500/5 transition-all group"
                >
                  <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-[28px] shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-pink-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black mb-1">Upload Video</p>
                    <p className="text-zinc-500 font-bold">or drag and drop here</p>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] bg-black rounded-[56px] overflow-hidden shadow-2xl relative group">
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <Play className="w-20 h-20 text-white/20" />
                  </div>
                  <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-white font-bold flex items-center gap-3">
                    <FileType className="w-5 h-5" />
                    {file.name}
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="absolute top-8 right-8 bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white hover:text-black transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 blur-3xl" />
                <div className="relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl rounded-[40px] p-3 flex items-center gap-3">
                  <div className="pl-8 flex items-center gap-4 flex-1">
                    <Youtube className="text-zinc-300 w-6 h-6" />
                    <input 
                      type="text" 
                      placeholder="Or paste YouTube URL..." 
                      value={ytUrl}
                      onChange={(e) => setYtUrl(e.target.value)}
                      className="bg-transparent border-none outline-none w-full py-5 text-lg font-bold placeholder:text-zinc-300"
                    />
                  </div>
                  <button 
                    onClick={handleYtDownload}
                    className="bg-[#FF4181] text-white p-5 rounded-[32px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-pink-200 dark:shadow-pink-900/20"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-10 rounded-[48px] shadow-xl border border-zinc-100 dark:border-zinc-800">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <RefreshCcw className="w-6 h-6 text-pink-500" />
                  Transform
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-[32px] bg-zinc-50 dark:bg-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Time Range</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500">Start</label>
                        <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500">Duration</label>
                        <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] bg-zinc-50 dark:bg-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Output Format</p>
                    <div className="flex flex-wrap gap-2">
                      {formats.map((f) => (
                        <button 
                          key={f}
                          onClick={() => setFormat(f)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            format === f 
                              ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" 
                              : "bg-white dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] bg-zinc-50 dark:bg-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Aspect Ratio</p>
                    <div className="grid grid-cols-2 gap-2">
                      {aspectRatios.map((ratio) => (
                        <button 
                          key={ratio.value}
                          onClick={() => setAspectRatio(ratio.value)}
                          className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            aspectRatio === ratio.value 
                              ? "bg-black dark:bg-white text-white dark:text-black shadow-lg" 
                              : "bg-white dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          <Layout className="w-3 h-3" />
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!file}
                  onClick={processVideo}
                  className="w-full mt-8 bg-black dark:bg-white text-white dark:text-black py-6 rounded-[28px] text-lg font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-2xl shadow-black/10"
                >
                  Process Video
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {mode === "processing" && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto h-[500px] flex flex-col items-center justify-center text-center space-y-10"
          >
            <div className="relative w-48 h-48">
              <motion.div 
                className="absolute inset-0 border-8 border-pink-500/20 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute inset-0 border-8 border-pink-500 rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-pink-500">
                {progress}%
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black">{status}</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-sm">Hardware Accelerated Encoding</p>
            </div>
          </motion.div>
        )}

        {mode === "result" && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            <div className="lg:col-span-8">
              <div className="bg-black rounded-[64px] overflow-hidden shadow-2xl aspect-video relative group border-8 border-white dark:border-zinc-900">
                <video src={outputUrl!} controls className="w-full h-full" />
                <button 
                  onClick={() => setMode("upload")}
                  className="absolute top-8 right-8 bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white hover:text-black transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-10 rounded-[56px] shadow-xl border border-zinc-100 dark:border-zinc-800">
                <h2 className="text-3xl font-black mb-10">Export Ready</h2>
                
                <div className="space-y-4 mb-10">
                  <div className="p-6 rounded-[32px] bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Format</p>
                      <p className="text-xl font-black">{format.toUpperCase()}</p>
                    </div>
                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-sm">
                      <FileType className="w-6 h-6 text-pink-500" />
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-[32px] bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-xl font-black">{duration}</p>
                    </div>
                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-sm">
                      <Clock className="w-6 h-6 text-pink-500" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <button className="w-full bg-pink-500 text-white py-8 rounded-[32px] text-xl font-black flex items-center justify-center gap-4 hover:bg-pink-600 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-pink-500/20">
                    <Download className="w-7 h-7" />
                    Download Result
                  </button>
                  <button 
                    onClick={() => setMode("upload")}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 py-6 rounded-[32px] text-lg font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    Start New Project
                  </button>
                </div>
              </div>

              <div className="p-10 rounded-[56px] bg-gradient-to-br from-[#1A1A1A] to-zinc-800 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 blur-[80px] rounded-full group-hover:bg-pink-500/20 transition-all" />
                <Scissors className="w-10 h-10 mb-6 text-pink-500" />
                <h4 className="text-2xl font-black mb-4">Smart Scene Detection</h4>
                <p className="font-bold opacity-60 leading-relaxed">
                  AI detected 4 key scenes in your video. Want to export them as individual clips?
                </p>
                <button className="mt-8 bg-white/10 px-8 py-3 rounded-xl text-sm font-black hover:bg-white hover:text-black transition-all">
                  Try Beta Feature
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="video/*"
      />
    </div>
  );
}
