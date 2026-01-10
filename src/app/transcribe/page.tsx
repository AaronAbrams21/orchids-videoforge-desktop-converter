"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  FileAudio, 
  Download,
  Loader2,
  CheckCircle2,
  X,
  Type,
  FileText,
  Languages,
  Mic,
  Waveform
} from "lucide-react";

export default function TranscribePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [transcription, setTranscription] = useState("");
  const [language, setLanguage] = useState("auto");
  const [model, setModel] = useState("tiny");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTranscription("");
    }
  };

  const startTranscription = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus("Initializing Whisper...");
    setProgress(0);

    try {
      const { pipeline } = await import("@xenova/transformers");
      
      setStatus(`Loading ${model} model...`);
      const transcriber = await pipeline('automatic-speech-recognition', `Xenova/whisper-${model}`, {
        progress_callback: (p: any) => {
          if (p.status === 'progress') {
            setProgress(Math.round(p.progress));
          }
        }
      });

      setStatus("Extracting audio...");
      // In a real app, we'd use FFmpeg to extract audio here, 
      // but Transformers.js can handle some video formats directly if the audio track is accessible.
      
      setStatus("Transcribing speech...");
      const result = await transcriber(URL.createObjectURL(file), {
        language: language === "auto" ? undefined : language,
        chunk_length_s: 30,
        stride_length_s: 5,
        callback_function: (p: any) => {
          // Real-time updates if supported
        }
      });

      setTranscription(Array.isArray(result) ? result[0].text : (result as any).text);
      setStatus("Complete");
    } catch (err) {
      console.error(err);
      setStatus("Transcription failed. Try a smaller model.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTranscript = () => {
    if (!transcription) return;
    const blob = new Blob([transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transcript.txt";
    link.click();
  };

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2">AI Transcribe</h1>
          <p className="text-zinc-500 font-medium">Convert video and audio to text using local Whisper AI.</p>
        </div>
        
        {file && !isProcessing && (
          <button 
            onClick={startTranscription}
            className="bg-purple-600 text-white px-10 py-4 rounded-[24px] font-black shadow-xl shadow-purple-200 hover:scale-105 transition-all flex items-center gap-3"
          >
            <Mic className="w-5 h-5" />
            Start Transcription
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Input & Results */}
        <div className="lg:col-span-8 space-y-8">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[48px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-purple-500 transition-all group"
            >
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-[24px] flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black">Select media file</p>
                <p className="text-zinc-500 font-medium">MP4, MP3, WAV, MKV supported</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                    <FileAudio className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">{file.name}</p>
                    <p className="text-xs text-zinc-400 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => {setFile(null); setTranscription("");}}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isProcessing && (
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between font-black">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                      <span>{status}</span>
                    </div>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {transcription && (
                <div className="bg-white dark:bg-zinc-900 p-10 rounded-[48px] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Type className="w-6 h-6 text-purple-600" />
                      <h3 className="text-2xl font-black">Transcript</h3>
                    </div>
                    <button 
                      onClick={downloadTranscript}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export TXT
                    </button>
                  </div>
                  <div className="p-8 bg-zinc-50 dark:bg-zinc-950 rounded-[32px] min-h-[300px] border border-zinc-100 dark:border-zinc-800">
                    <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {transcription}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 space-y-8">
            <h3 className="text-xl font-black">AI Configuration</h3>
            
            <div className="space-y-4">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Whisper Model</p>
              <div className="grid gap-3">
                {[
                  { id: "tiny", label: "Tiny (Fastest)", desc: "Lowest accuracy" },
                  { id: "base", label: "Base (Balanced)", desc: "Good for English" },
                  { id: "small", label: "Small (Accurate)", desc: "Requires more RAM" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setModel(item.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      model === item.id 
                        ? "border-purple-500 bg-purple-50/50 dark:bg-purple-500/10" 
                        : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"
                    }`}
                  >
                    <p className="font-bold text-sm">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Language</p>
              <div className="relative">
                <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold appearance-none cursor-pointer"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 bg-purple-600 rounded-[40px] text-white shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <Waveform className="w-6 h-6" />
              <h4 className="text-lg font-black">Local Engine</h4>
            </div>
            <p className="text-sm font-medium opacity-90 leading-relaxed">
              Whisper runs entirely in your browser using WebAssembly. No data is sent to external servers.
            </p>
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="video/*,audio/*"
      />
    </div>
  );
}
