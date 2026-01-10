"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Scissors, 
  FileType, 
  Download,
  Loader2,
  CheckCircle2,
  X,
  Plus,
  Clock,
  ChevronDown,
  Monitor,
  Maximize2,
  Smartphone
} from "lucide-react";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const BASE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("00:00:00");
  const [duration, setDuration] = useState("00:00:10");
  const [format, setFormat] = useState("mp4");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  
  const ffmpegRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFFmpeg = async () => {
    setStatus("Loading engine...");
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    
    ffmpeg.on("log", ({ message }) => console.log(message));
    ffmpeg.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    setStatus("Engine ready");
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOutputUrl(null);
    }
  };

  const processVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus("Processing...");
    const ffmpeg = ffmpegRef.current;
    
    try {
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));
      
      const args = [
        "-ss", startTime, 
        "-t", duration, 
        "-i", "input.mp4"
      ];

      // Add cropping based on aspect ratio
      if (aspectRatio === "9:16") {
        args.push("-vf", "crop=ih*9/16:ih");
      } else if (aspectRatio === "1:1") {
        args.push("-vf", "crop=ih:ih");
      } else if (aspectRatio === "4:5") {
        args.push("-vf", "crop=ih*4/5:ih");
      }

      args.push(`output.${format}`);
      
      await ffmpeg.exec(args);
      
      const data = await ffmpeg.readFile(`output.${format}`);
      const url = URL.createObjectURL(new Blob([data], { type: `video/${format}` }));
      setOutputUrl(url);
      setStatus("Complete");
    } catch (err) {
      console.error(err);
      setStatus("Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2">Convert & Crop</h1>
          <p className="text-zinc-500 font-medium">Professional video formatting and clipping tools.</p>
        </div>
        
        {file && !isProcessing && (
          <button 
            onClick={processVideo}
            className="bg-pink-500 text-white px-10 py-4 rounded-[24px] font-black shadow-xl shadow-pink-200 hover:scale-105 transition-all flex items-center gap-3"
          >
            <Scissors className="w-5 h-5" />
            Process Video
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Input/Preview */}
        <div className="lg:col-span-7 space-y-8">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[48px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-pink-500 transition-all group"
            >
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-[24px] flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black">Drop your video here</p>
                <p className="text-zinc-500 font-medium">MP4, WEBM, MOV supported</p>
              </div>
            </div>
          ) : (
            <div className="bg-black rounded-[48px] overflow-hidden shadow-2xl aspect-video relative">
              <video 
                src={outputUrl || URL.createObjectURL(file)} 
                controls 
                className="w-full h-full"
              />
              <button 
                onClick={() => setFile(null)}
                className="absolute top-6 right-6 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white hover:text-black transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-800 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between font-black">
                  <span>{status}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 space-y-8">
            <h3 className="text-xl font-black">Export Settings</h3>
            
            <div className="space-y-4">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Aspect Ratio</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "16:9", icon: Monitor, label: "Landscape" },
                  { id: "9:16", icon: Smartphone, label: "Tiktok/Reels" },
                  { id: "1:1", icon: Maximize2, label: "Square" },
                  { id: "4:5", icon: Maximize2, label: "Portrait" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAspectRatio(item.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                      aspectRatio === item.id 
                        ? "border-pink-500 bg-pink-50/50 dark:bg-pink-500/10 text-pink-500" 
                        : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Time Clipping</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 pl-1">Start Time</label>
                  <input 
                    type="text" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="00:00:00"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 pl-1">Duration</label>
                  <input 
                    type="text" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="00:00:10"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Output Format</p>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="mp4">MP4 (H.264)</option>
                <option value="webm">WebM (VP9)</option>
                <option value="mov">MOV (QuickTime)</option>
                <option value="gif">GIF (Animated)</option>
              </select>
            </div>
          </div>

          {outputUrl && (
            <button 
              onClick={() => {
                const link = document.createElement("a");
                link.href = outputUrl;
                link.download = `converted.${format}`;
                link.click();
              }}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-6 rounded-[32px] text-xl font-black flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-2xl"
            >
              <Download className="w-6 h-6" />
              Download Result
            </button>
          )}
        </div>
      </div>

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
