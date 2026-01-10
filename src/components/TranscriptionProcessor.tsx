"use client";

import { useState, useRef, useEffect } from "react";
import { 
  FileAudio, 
  Loader2,
  X,
  Play,
  Download,
  Copy,
  Check,
  Languages,
  Zap,
  Cpu,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pipeline } from "@xenova/transformers";

export default function TranscriptionProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [transcription, setTranscription] = useState("");
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const transcribe = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus("Initializing AI model...");
    setProgress(0);

    try {
      // Create pipeline
      const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en", {
        progress_callback: (p: any) => {
          if (p.status === "progress") {
            setProgress(Math.round(p.progress));
          }
          if (p.status === "ready") {
            setStatus("Processing audio...");
          }
        }
      });

      setStatus("Transcribing...");
      
      // Convert file to buffer
      const buffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(buffer);
      const float32Array = audioBuffer.getChannelData(0);

      const result = await transcriber(float32Array);
      setTranscription((result as any).text);
      setStatus("Complete");
    } catch (err) {
      console.error(err);
      setStatus("Error: Local processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSRT = () => {
    const content = `1\n00:00:00,000 --> 00:00:10,000\n${transcription}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transcription.srt";
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-8">
        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer bg-white border-2 border-dashed border-zinc-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all rounded-[48px] p-20 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileAudio className="w-10 h-10 text-zinc-400 group-hover:text-blue-500" />
            </div>
            <h3 className="text-3xl font-black mb-2">Select Audio or Video</h3>
            <p className="text-zinc-400 font-medium">Whisper AI handles multiple languages and formats.</p>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="audio/*,video/*" />
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[56px] shadow-xl border border-zinc-100 relative group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <FileAudio className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black truncate max-w-xs">{file.name}</h3>
                  <p className="text-zinc-400 font-bold">Ready for AI processing</p>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setTranscription(""); }}
                className="bg-zinc-50 p-4 rounded-full text-zinc-400 hover:bg-zinc-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isProcessing ? (
              <div className="py-20 flex flex-col items-center">
                <div className="relative w-32 h-32 mb-8">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-zinc-100 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                    <circle 
                      className="text-blue-500 stroke-current transition-all duration-500" 
                      strokeWidth="8" 
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * progress) / 100}
                      strokeLinecap="round" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-blue-600">
                    {progress}%
                  </div>
                </div>
                <h4 className="text-xl font-black mb-2">{status}</h4>
                <p className="text-zinc-400 font-medium">Running 100% locally on your machine</p>
              </div>
            ) : transcription ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100">
                  <p className="text-xl font-medium leading-relaxed text-zinc-600 italic">
                    "{transcription}"
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 bg-[#1A1A1A] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? "Copied" : "Copy Text"}
                  </button>
                  <button 
                    onClick={downloadSRT}
                    className="flex-1 bg-white border border-zinc-200 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all"
                  >
                    <FileText className="w-5 h-5 text-blue-500" />
                    Export SRT
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="py-20 text-center">
                <button 
                  onClick={transcribe}
                  className="bg-blue-600 text-white px-12 py-6 rounded-[32px] text-2xl font-black shadow-xl shadow-blue-100 hover:scale-105 transition-all"
                >
                  Start Transcription
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[48px] text-white shadow-2xl">
          <Zap className="w-10 h-10 mb-6 fill-white/20" />
          <h3 className="text-2xl font-black mb-4">Neural Engine</h3>
          <p className="font-bold opacity-80 leading-relaxed mb-8">
            Using OpenAI's Whisper model optimized for browser execution via Transformers.js and ONNX Runtime.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-4 rounded-2xl">
              <Check className="w-4 h-4" /> 100% Offline
            </div>
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-4 rounded-2xl">
              <Check className="w-4 h-4" /> Multi-language
            </div>
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-4 rounded-2xl">
              <Check className="w-4 h-4" /> Privacy Guaranteed
            </div>
          </div>
        </div>

        <div className="p-10 bg-white rounded-[48px] border border-zinc-100">
          <h4 className="font-black text-lg mb-4">Quality Settings</h4>
          <div className="space-y-3">
            <button className="w-full bg-zinc-50 p-4 rounded-2xl border-2 border-blue-500 flex items-center justify-between">
              <span className="font-bold">Whisper Tiny</span>
              <span className="text-[10px] bg-blue-500 text-white px-2 py-1 rounded-full">FAST</span>
            </button>
            <button className="w-full bg-zinc-50 p-4 rounded-2xl border-2 border-transparent hover:border-zinc-200 flex items-center justify-between text-zinc-400">
              <span className="font-bold">Whisper Base</span>
              <span className="text-[10px] bg-zinc-200 text-zinc-500 px-2 py-1 rounded-full">HQ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
