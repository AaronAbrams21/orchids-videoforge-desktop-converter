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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![download_youtube_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
