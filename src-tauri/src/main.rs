// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, AppHandle};
use tauri_plugin_shell::ShellExt;

#[command]
async fn download_youtube_video(app: AppHandle, url: String) -> Result<String, String> {
    let output_path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("temp_video.mp4");

    let sidecar_command = app
        .shell()
        .sidecar("yt-dlp")
        .map_err(|e| e.to_string())?
        .args(["-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best", "-o", output_path.to_str().unwrap(), &url]);

    let (mut _rx, mut _child) = sidecar_command
        .spawn()
        .map_err(|e| e.to_string())?;

    // In a real app, you'd want to handle the output/errors properly
    // and maybe return the path to the frontend.
    
    Ok(output_path.to_str().unwrap().to_string())
}

#[command]
async fn process_video(
    app: AppHandle,
    input_path: String,
    start_time: String,
    duration: String,
    format: String,
) -> Result<String, String> {
    let output_path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join(format!("output.{}", format));

    let sidecar_command = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args([
            "-ss", &start_time,
            "-t", &duration,
            "-i", &input_path,
            "-y", // Overwrite output file
            output_path.to_str().unwrap(),
        ]);

    let output = sidecar_command
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(output_path.to_str().unwrap().to_string())
}

#[command]
async fn get_video_audio(app: AppHandle, input_path: String) -> Result<Vec<u8>, String> {
    let audio_path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("temp_audio.wav");

    let sidecar_command = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args([
            "-i", &input_path,
            "-ar", "16000",
            "-ac", "1",
            "-c:a", "pcm_s16le",
            "-y",
            audio_path.to_str().unwrap(),
        ]);

    sidecar_command
        .output()
        .await
        .map_err(|e| e.to_string())?;

    std::fs::read(audio_path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            download_youtube_video,
            process_video,
            get_video_audio
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
