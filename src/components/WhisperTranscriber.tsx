"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  X,
  Play,
  Download,
  FileText,
  Brain,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core"; // ← Tauri v2 import (check your version)

const WHISPER_MODELS = [
  "tiny",
  "tiny.en",
  "base",
  "base.en",
  "small",
  "small.en",
  "medium",
  "medium.en",
  "large-v3",
  "large-v3-turbo",
] as const;

type ModelType = (typeof WHISPER_MODELS)[number];

interface Props {
  file: File;
  onCancel: () => void;
}

export default function WhisperTranscriber({ file, onCancel }: Props) {
  const [selectedModel, setSelectedModel] = useState<ModelType>("small.en");
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch already downloaded models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models: string[] = await invoke("list_downloaded_models");
        setDownloadedModels(models);
        if (models.length > 0 && !models.includes(selectedModel)) {
          setSelectedModel(models[0] as ModelType);
        }
      } catch (err: any) {
        console.error("Failed to load models:", err);
      }
    };
    loadModels();
  }, []);

  const ensureModelAndTranscribe = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatus(`Ensuring ${selectedModel} model is downloaded...`);

    try {
      // Step 1: Ensure model is downloaded (Rust will download if missing)
      await invoke("ensure_whisper_model", { modelName: selectedModel });
      setProgress(30);
      setStatus("Model ready → Preparing transcription...");

      // Step 2: For now – we need real filesystem path.
      // This is the limitation: <input type="file"> File object doesn't give path in Tauri
      // Temporary workaround: Show instructions / assume WAV or add file picker in future
      setStatus(
        "Waiting for compatible 16kHz mono WAV file...\n\n" +
        "(Current limitation: only pre-converted WAV files work until ffmpeg is added)"
      );

      // Placeholder: You need actual path here.
      // Replace with real path when you implement file picker or drag&drop with path
      const fakeWavPath = "/path/to/your/16khz-mono-file.wav"; // ← REPLACE THIS

      setStatus("Running native whisper.cpp transcription...");

      const result = await invoke<any>("transcribe_wav", {
        wavPath: fakeWavPath,
        modelName: selectedModel,
        language: null, // auto-detect
        translateToEnglish: false,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setTranscription(result.text);
      setStatus(`Transcription complete! (Language: ${result.detected_language || "auto"})`);
      setProgress(100);
    } catch (err: any) {
      console.error("Transcription error:", err);
      setError(err?.message || "Failed to transcribe audio");
      setStatus("Transcription failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportAsSRT = () => {
    if (!transcription) return;

    const srt = `1
00:00:00,000 --> 00:01:00,000
${transcription.trim()}

`;

    const blob = new Blob([srt], { type: "text/srt" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}_transcript.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-zinc-900 rounded-[56px] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
    >
      <div className="p-10 lg:p-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black">AI Transcriber</h2>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">
                whisper.cpp – Native Desktop (Local & Powerful)
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!transcription ? (
          <div className="space-y-10">
            <div className="p-10 rounded-[40px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 text-center">
              <FileText className="w-16 h-16 text-zinc-200 dark:text-zinc-700 mx-auto mb-6" />
              <p className="text-xl font-bold mb-2">{file.name}</p>
              <p className="text-zinc-400 font-medium">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for native processing
              </p>
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Whisper Model (whisper.cpp)
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                disabled={isProcessing}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WHISPER_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m} {downloadedModels.includes(m) ? "(downloaded)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">
                Larger models = better quality, slower first download
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{status}</span>
                <span className="text-blue-500 font-black">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="bg-blue-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button
              onClick={ensureModelAndTranscribe}
              disabled={isProcessing}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-8 rounded-[32px] text-2xl font-black flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Play className="w-8 h-8 fill-current" />
              )}
              {isProcessing ? "Processing..." : "Start Native Transcription"}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-10 rounded-[40px] border border-blue-100 dark:border-blue-900/30 max-h-[50vh] overflow-y-auto">
              <p className="text-2xl font-medium leading-relaxed text-zinc-800 dark:text-zinc-200 italic">
                "{transcription}"
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={exportAsSRT}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-6 rounded-[32px] text-xl font-black flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                <Download className="w-6 h-6" />
                Export SRT
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(transcription ?? "")}
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 py-6 rounded-[32px] text-xl font-black hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Copy Text
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 py-4 text-green-500 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              100% Local • whisper.cpp • Desktop Native
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}