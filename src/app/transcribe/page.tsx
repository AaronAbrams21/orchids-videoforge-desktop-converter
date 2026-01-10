"use client";

import { useState, useRef } from "react";
import { 
  FileAudio, 
  Upload, 
  Play, 
  Pause, 
  Download, 
  Copy, 
  Check,
  Languages,
  Clock,
  Settings2,
  X,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TranscribePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processTranscription(selectedFile);
    }
  };

  const processTranscription = async (input: File) => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 2;
      });
    }, 200);

    // Mock processing time
    await new Promise(r => setTimeout(r, 4000));
    
    setTranscription("The quick brown fox jumps over the lazy dog. This is a sample transcription generated locally using the Whisper AI model. It ensures your data never leaves your device while providing high-quality speech-to-text conversion. You can export this as TXT, SRT, or VTT formats.");
    setProgress(100);
    setIsProcessing(false);
    clearInterval(interval);
  };

  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2">Transcriber</h1>
          <p className="text-zinc-500 font-medium text-lg">AI-powered speech to text, 100% offline.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-[#F8F9FB] dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                <Languages className="w-4 h-4 text-zinc-400" />
              </div>
            ))}
          </div>
          <span className="text-sm font-bold text-zinc-400">99+ Languages</span>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!transcription && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative"
          >
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-[400px] border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[64px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-pink-500/50 hover:bg-pink-50/30 dark:hover:bg-pink-500/5 transition-all group-active:scale-[0.98]"
            >
              <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[32px] shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-pink-500" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black mb-2">Drop your audio or video file</p>
                <p className="text-zinc-500 font-bold">MP3, WAV, MP4, MKV up to 500MB</p>
              </div>
              <button className="mt-4 bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-[24px] font-black shadow-xl shadow-black/10 dark:shadow-white/10 hover:scale-105 transition-all">
                Select File
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="audio/*,video/*"
            />
          </motion.div>
        )}

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[400px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[64px] shadow-2xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative w-40 h-40 mb-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-zinc-100 dark:text-zinc-800"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * progress) / 100}
                  className="text-pink-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-black">{progress}%</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Processing</span>
              </div>
            </div>
            <h2 className="text-2xl font-black mb-2">Analyzing speech patterns...</h2>
            <p className="text-zinc-500 font-medium max-w-sm">
              This might take a minute depending on your hardware. Using Whisper Tiny model.
            </p>
          </motion.div>
        )}

        {transcription && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-12 rounded-[56px] shadow-xl border border-zinc-100 dark:border-zinc-800 relative group">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Transcription</p>
                      <p className="font-bold">{file?.name || "Audio File"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-all active:scale-95"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => setTranscription(null)}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-red-500 transition-all active:scale-95"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-10 rounded-[40px] min-h-[300px]">
                  <p className="text-xl font-medium leading-relaxed text-zinc-700 dark:text-zinc-300 italic">
                    {transcription}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-10 rounded-[48px] shadow-xl border border-zinc-100 dark:border-zinc-800">
                <h3 className="text-2xl font-black mb-8">Export</h3>
                <div className="grid gap-4">
                  {[
                    { label: "Text File", format: ".txt", icon: Download },
                    { label: "Subtitles", format: ".srt", icon: Download },
                    { label: "VTT Format", format: ".vtt", icon: Download },
                  ].map((btn, i) => (
                    <button 
                      key={i}
                      className="w-full flex items-center justify-between p-6 rounded-[28px] bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
                          <btn.icon className="w-5 h-5 text-pink-500" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{btn.label}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{btn.format}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-10 rounded-[48px] bg-black text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full" />
                <Settings2 className="w-10 h-10 mb-6 text-pink-500" />
                <h4 className="text-xl font-black mb-2">Speaker Diarization</h4>
                <p className="text-sm font-bold opacity-60 leading-relaxed mb-6">
                  Automatically detect and label different speakers in your audio.
                </p>
                <button className="w-full bg-zinc-800 py-4 rounded-2xl text-sm font-black hover:bg-zinc-700 transition-colors">
                  Enabled in Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
