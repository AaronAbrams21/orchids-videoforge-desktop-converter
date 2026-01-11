// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::Manager;
use tauri::{command, AppHandle};
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext};
use hound::{WavReader, SampleFormat};
use anyhow::{Context, Result};
use std::path::PathBuf;
use std::fs;
use directories::ProjectDirs;
use reqwest::Client;
use futures_util::StreamExt;
use tokio::fs::File as TokioFile;
use tokio::io::AsyncWriteExt;

#[derive(serde::Serialize)]
struct TranscriptionResult {
    text: String,
    detected_language: Option<String>,
    error: Option<String>,
}

fn get_models_dir(app: &AppHandle) -> Result<PathBuf> {
    let mut dir = app.path().app_local_data_dir()?;
    dir.push("whisper_models");
    fs::create_dir_all(&dir)?;
    Ok(dir)
}

async fn download_model(app: AppHandle, model_name: &str) -> Result<PathBuf, String> {
    let models_dir = get_models_dir(&app).map_err(|e| e.to_string())?;
    let target_path = models_dir.join(format!("ggml-{}.bin", model_name));

    if target_path.exists() {
        return Ok(target_path);
    }

    let url = format!(
        "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-{}.bin",
        model_name
    );

    let client = Client::builder()
        .user_agent("Convrt-Tauri/0.1.0")
        .build()
        .map_err(|e| e.to_string())?;

    let mut response = client.get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to start download: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let mut file = TokioFile::create(&target_path)
        .await
        .map_err(|e| e.to_string())?;

    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;
    }

    Ok(target_path)
}

#[command]
async fn ensure_whisper_model(app: AppHandle, model_name: String) -> Result<String, String> {
    let path = download_model(app, &model_name).await?;
    Ok(path.to_string_lossy().to_string())
}

#[command]
async fn transcribe_wav(
    app: AppHandle,
    wav_path: String,
    model_name: String,
    language: Option<String>,      // "en", "ur", None = auto
    translate_to_english: bool,
) -> Result<TranscriptionResult, String> {
    // Ensure model exists
    let model_path = ensure_whisper_model(app, model_name).await?;

    // Load model
    let ctx = WhisperContext::new(&model_path)
    .map_err(|e| format!("Failed to load model: {}", e))?;

    // Read WAV (must be 16kHz mono float32 for now)
    let mut reader = WavReader::open(&wav_path)
        .map_err(|e| format!("Cannot open WAV file: {}", e))?;

    let spec = reader.spec();

    if spec.channels != 1 || spec.sample_rate != 16000 {
        return Err("Audio must be 16kHz **mono** WAV file (we'll add conversion later)".to_string());
    }

    let samples: Vec<f32> = match spec.sample_format {
        SampleFormat::Float => reader.samples::<f32>()
            .map(|s| s.unwrap_or(0.0))
            .collect(),
        _ => return Err("Only 32-bit float WAV supported at the moment".to_string()),
    };

    // Prepare inference parameters
    let mut params = FullParams::new(SamplingStrategy::default());
    params.set_language(language.as_deref());
    params.set_translate(translate_to_english);

    // Run transcription
    let mut state = ctx.create_state()
        .map_err(|e| format!("Cannot create inference state: {}", e))?;

    state.full(params, &samples)
        .map_err(|e| format!("Transcription failed: {}", e))?;

    // Collect result
    let mut text = String::new();
    let n_segments = state.full_n_segments()
        .map_err(|e| e.to_string())?;

    for i in 0..n_segments {
        let segment_text = state.full_get_segment_text(i)
            .map_err(|e| e.to_string())?;
        text.push_str(&segment_text);
        text.push(' ');
    }
    let detected_lang = state.full_lang_id_from_state()
    .ok()
    .and_then(|id| ctx.token_to_str(id).ok())
    .map(|s| s.to_string());

    Ok(TranscriptionResult {
        text: text.trim().to_string(),
        detected_language: detected_lang,
        error: None,
    })
}
#[tauri::command]
async fn download_youtube_video(url: String) -> Result<String, String> {
    Ok(format!("Downloaded video from: {}", url))
}
#[command]
async fn list_downloaded_models(app: AppHandle) -> Result<Vec<String>, String> {
    let dir = get_models_dir(&app).map_err(|e| e.to_string())?;
    let mut models = Vec::new();

    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("bin") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    if stem.starts_with("ggml-") {
                        models.push(stem.replace("ggml-", ""));
                    }
                }
            }
        }
    }

    Ok(models)
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            download_youtube_video,
            ensure_whisper_model,
            transcribe_wav,
            list_downloaded_models
        ])
        
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}