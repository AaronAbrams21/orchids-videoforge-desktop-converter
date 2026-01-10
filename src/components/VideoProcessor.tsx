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
  RefreshCcw,
  Youtube
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { invoke } from "@tauri-apps/api/core";

const BASE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

export default function VideoProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [ytUrl, setYtUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("00:00:00");
  const [duration, setDuration] = useState("00:00:10");
  const [format, setFormat] = useState("mp4");
  const [aspectRatio, setAspectRatio] = useState("original");
  
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFFmpeg = async () => {
    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => console.log(message));
    ffmpeg.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegRef.current = ffmpeg;
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleYtDownload = async () => {
    if (!ytUrl) return;
    setIsProcessing(true);
    setStatus("Downloading from YouTube...");
    try {
      const videoPath = await invoke<string>("download_youtube_video", { url: ytUrl });
      const response = await fetch(videoPath);
      const blob = await response.blob();
      const downloadedFile = new File([blob], "youtube_video.mp4", { type: "video/mp4" });
      setFile(downloadedFile);
    } catch (err) {
      console.error("YouTube download failed:", err);
      setStatus("Download failed. Desktop app required.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processVideo = async () => {
    if (!file || !ffmpegRef.current) return;
    setIsProcessing(true);
    setStatus("Processing...");
    const ffmpeg = ffmpegRef.current;
    
    try {
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));
      
      const args = ["-ss", startTime, "-t", duration, "-i", "input.mp4"];
      
      if (aspectRatio === "9:16") {
        args.push("-vf", "crop=ih*9/16:ih");
      } else if (aspectRatio === "1:1") {
        args.push("-vf", "crop=ih:ih");
      }
      
      args.push(`output.${format}`);
      
      await ffmpeg.exec(args);
      
      const data = await ffmpeg.readFile(`output.${format}`);
      const url = URL.createObjectURL(new Blob([data], { type: `video/${format}` }));
      setOutputUrl(url);
      setStatus("Complete");
    } catch (err) {
      console.error(err);
      setStatus("Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-8">
        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer bg-white border-2 border-dashed border-zinc-200 hover:border-pink-500 hover:bg-pink-50/30 transition-all rounded-[48px] p-20 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-zinc-400 group-hover:text-pink-500" />
            </div>
            <h3 className="text-3xl font-black mb-2">Drop your video here</h3>
            <p className="text-zinc-400 font-medium">Or click to browse from your computer</p>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="video/*" />
          </div>
        ) : (
          <div className="bg-black rounded-[48px] overflow-hidden aspect-video relative group shadow-2xl">
            {outputUrl ? (
              <video src={outputUrl} controls className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <p className="text-zinc-500 font-bold">Preview will appear here</p>
              </div>
            )}
            <button 
              onClick={() => { setFile(null); setOutputUrl(null); }}
              className="absolute top-6 right-6 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white hover:text-black transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="bg-white p-10 rounded-[48px] border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <Youtube className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-black">Import from URL</h3>
          </div>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Paste YouTube or Social Media link..." 
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 font-bold outline-none"
            />
            <button 
              onClick={handleYtDownload}
              className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all"
            >
              Fetch
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm sticky top-12">
          <h2 className="text-3xl font-black mb-8">Controls</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-zinc-300 uppercase tracking-widest block mb-3">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "original", icon: Monitor, label: "Original" },
                  { id: "9:16", icon: Smartphone, label: "TikTok" },
                  { id: "1:1", icon: Square, label: "Square" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAspectRatio(item.id)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      aspectRatio === item.id ? "border-pink-500 bg-pink-50" : "border-zinc-50 hover:border-zinc-100"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${aspectRatio === item.id ? "text-pink-500" : "text-zinc-400"}`} />
                    <span className="text-[10px] font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-zinc-300 uppercase tracking-widest block mb-2">Start Time</label>
                <input 
                  type="text" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 font-bold text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-black text-zinc-300 uppercase tracking-widest block mb-2">Duration</label>
                <input 
                  type="text" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 font-bold text-sm"
                />
              </div>
            </div>

            <button 
              disabled={!file || isProcessing}
              onClick={processVideo}
              className="w-full bg-pink-500 text-white py-6 rounded-[32px] text-xl font-black shadow-xl shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{progress}%</span>
                </div>
              ) : (
                "Start Processing"
              )}
            </button>

            {outputUrl && (
              <button 
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = outputUrl;
                  link.download = `converted.${format}`;
                  link.click();
                }}
                className="w-full bg-[#1A1A1A] text-white py-6 rounded-[32px] text-xl font-black flex items-center justify-center gap-3"
              >
                <Download className="w-6 h-6" />
                Download
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
