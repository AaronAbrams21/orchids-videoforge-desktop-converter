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
  Play,
  AlertTriangle,
} from "lucide-react";

interface Props {
  file: File;
  onCancel: () => void;
}

export default function FFmpegProcessor({ file, onCancel }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing FFmpeg engine...");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<"mp4" | "webm" | "gif">("mp4");
  const [crop, setCrop] = useState<"none" | "tiktok" | "square">("none");
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");

  const ffmpegRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initFFmpeg = async () => {
      try {
        setStatus("Loading FFmpeg engine (this may take a moment)...");

        const { FFmpeg } = await import("@ffmpeg/ffmpeg");
        const { fetchFile } = await import("@ffmpeg/util");

        const ffmpeg = new FFmpeg();

        ffmpeg.on("log", ({ message }) => {
          console.log("[FFmpeg]", message);
          // Parse progress from logs if needed
          if (message.includes("time=")) {
            // Optional: more accurate progress parsing
          }
        });

        ffmpeg.on("progress", ({ progress }) => {
          setProgress(Math.round(progress * 100));
        });

        await ffmpeg.load({
          coreURL: "/ffmpeg/ffmpeg-core.js",
          wasmURL: "/ffmpeg/ffmpeg-core.wasm",
        });

        if (isMounted) {
          ffmpegRef.current = ffmpeg;
          setIsEngineReady(true);
          setStatus("Engine ready! Configure and start conversion.");
        }
      } catch (err: any) {
        console.error("FFmpeg init failed:", err);
        setError("Failed to load FFmpeg engine: " + (err.message || "Unknown error"));
        setStatus("Engine failed to load");
      }
    };

    initFFmpeg();

    return () => {
      isMounted = false;
      // Cleanup virtual FS on unmount
      if (ffmpegRef.current) {
        ffmpegRef.current.terminate?.();
      }
    };
  }, []);

  const processVideo = async () => {
    if (!ffmpegRef.current || !isEngineReady) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus("Starting conversion...");
    setError(null);

    const ffmpeg = ffmpegRef.current;
    const inputFile = "input.mp4";
    const outputFile = `output.${format}`;

    try {
      // Write input file
      setStatus("Writing input file to memory...");
      await ffmpeg.writeFile(inputFile, await fetchFile(file));

      // Build command
      const args = ["-i", inputFile];

      // Crop filter
      if (crop !== "none") {
        let vf = crop === "tiktok" ? "crop=ih*9/16:ih" : "crop=ih:ih";
        args.push("-vf", vf);
      }

      // Quality/encoding options
      if (format === "mp4") {
        args.push("-c:v", "libx264", "-preset", quality === "high" ? "slow" : "fast");
        if (quality === "low") args.push("-crf", "28");
        else if (quality === "medium") args.push("-crf", "23");
        else args.push("-crf", "18");
      } else if (format === "webm") {
        args.push("-c:v", "libvpx-vp9", "-b:v", quality === "high" ? "1M" : "500k");
      } else if (format === "gif") {
        args.push("-vf", "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse");
      }

      args.push(outputFile);

      // Execute
      setStatus("Running FFmpeg conversion...");
      await ffmpeg.exec(args);

      // Read output
      setStatus("Reading output file...");
      const data = await ffmpeg.readFile(outputFile);
      const blob = new Blob([data.buffer], { type: `video/${format}` });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      setStatus("Conversion complete! Ready to download.");
    } catch (err: any) {
      console.error("Conversion failed:", err);
      setError("Conversion failed: " + (err.message || "Unknown error"));
      setStatus("Conversion failed");
    } finally {
      // Cleanup files from virtual FS
      try {
        await ffmpeg.deleteFile(inputFile);
        await ffmpeg.deleteFile(outputFile);
      } catch { }
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
        {/* Add quality select if you want */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-500">Quality</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            disabled={!isEngineReady || isProcessing}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-pink-500/20 disabled:opacity-50"
          >
            <option value="high">High Quality (larger file)</option>
            <option value="medium">Balanced</option>
            <option value="low">Fast/Small file</option>
          </select>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}
        <div className="p-10 lg:p-12 space-y-8">
          <div>
            <h2 className="text-3xl font-black mb-2">Export Settings</h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">
              Configure your output
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500">Crop Preset</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value as any)}
                  disabled={!isEngineReady || isProcessing}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-pink-500/20 disabled:opacity-50"
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
                  onChange={(e) => setFormat(e.target.value as any)}
                  disabled={!isEngineReady || isProcessing}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-pink-500/20 disabled:opacity-50"
                >
                  <option value="mp4">MP4 (Standard)</option>
                  <option value="webm">WebM</option>
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
              <p className="mt-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {status}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={processVideo}
              disabled={isProcessing || !isEngineReady}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black py-6 rounded-[32px] text-xl font-black flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
              {isProcessing
                ? "Processing..."
                : isEngineReady
                  ? "Start Conversion"
                  : "Loading Engine..."}
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