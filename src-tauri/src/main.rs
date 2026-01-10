// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, AppHandle, Manager};
use tauri_plugin_shell::ShellExt;
use std::path::PathBuf;

#[command]
async fn download_youtube_video(app: AppHandle, url: String) -> Result<String, String> {
    let output_path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("temp_video.mp4");

    // Ensure directory exists
    std::fs::create_dir_all(output_path.parent().unwrap()).map_err(|e| e.to_string())?;

    let sidecar_command = app
        .shell()
        .sidecar("yt-dlp")
        .map_err(|e| e.to_string())?
        .args([
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "--merge-output-format", "mp4",
            "-o", output_path.to_str().unwrap(),
            &url
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
async fn process_video(
    app: AppHandle,
    input_path: String,
    start_time: String,
    duration: String,
    format: String
) -> Result<String, String> {
    let output_path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join(format!("processed_video.{}", format));

    let sidecar_command = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args([
            "-y",
            "-ss", &start_time,
            "-t", &duration,
            "-i", &input_path,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-c:a", "aac",
            output_path.to_str().unwrap()
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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            download_youtube_video,
            process_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
