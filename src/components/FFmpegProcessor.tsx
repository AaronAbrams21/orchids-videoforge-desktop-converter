"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Scissors, 
  Download,
  Loader2,
  X,
  ChevronDown,
  Video,
  Play
} from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const BASE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

interface Props {
  file: File;
  onCancel: () => void;
}

export default function FFmpegProcessor({ file, onCancel }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready to process");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [format, setFormat] = useState("mp4");
  const [crop, setCrop] = useState("none");
  
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => console.log(message));
    ffmpeg.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    setStatus("Engine ready");
  };

  useEffect(() => {
    load();
  }, []);

  const process = async () => {
    setIsProcessing(true);
    setStatus("Processing video...");
    const ffmpeg = ffmpegRef.current;
    
    try {
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));
      
      const args = ["-i", "input.mp4"];
      
      if (crop === "tiktok") {
        args.push("-vf", "crop=ih*9/16:ih");
      } else if (crop === "square") {
        args.push("-vf", "crop=ih:ih");
      }
      
      args.push(`output.${format}`);
      
      await ffmpeg.exec(args);
      
      const data = await ffmpeg.readFile(`output.${format}`);
      const url = URL.createObjectURL(new Blob([data], { type: `video/${format}` }));
      setOutputUrl(url);
      setStatus("Processing complete");
    } catch (err) {
      console.error(err);
      setStatus("Error processing video");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-zinc-900 rounded-[56px] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Preview Area */}
        <div className="bg-black aspect-video relative group flex items-center justify-center">
          {outputUrl ? (
            <video src={outputUrl} controls className="w-full h-full" />
          ) : (
            <div className="text-zinc-500 flex flex-col items-center gap-4">
              <Video className="w-12 h-12 opacity-20" />
              <p className="font-bold">Preview will appear here</p>
            </div>
          )}
          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white hover:text-black transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Area */}
        <div className="p-10 lg:p-12 space-y-8">
          <div>
            <h2 className="text-3xl font-black mb-2">Export Settings</h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Configure your output</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500">Crop Preset</label>
                <select 
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-pink-500/20"
                >
                  <option value="none">Original (No Crop)</option>
                  <option value="tiktok">9:16 (TikTok/Reels)</option>
                  <option value="square">1:1 (Square)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500">Output Format</label>
                <select 
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-pink-500/20"
                >
                  <option value="mp4">MP4 (Standard)</option>
                  <option value="webm">WebM (Transparent)</option>
                  <option value="gif">GIF (Animated)</option>
                </select>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Processing Status</span>
                <span className="text-pink-500 font-black">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-pink-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">{status}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={process}
              disabled={isProcessing}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black py-6 rounded-[32px] text-xl font-black flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
              {isProcessing ? "Processing..." : "Start Conversion"}
            </button>
            {outputUrl && (
              <button 
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = outputUrl;
                  link.download = `converted.${format}`;
                  link.click();
                }}
                className="bg-pink-500 text-white p-6 rounded-[32px] hover:scale-110 active:scale-95 transition-all shadow-xl shadow-pink-200"
              >
                <Download className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
