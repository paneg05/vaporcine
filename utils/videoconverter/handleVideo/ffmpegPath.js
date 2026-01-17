import path from "path";
import os from "os";

let ffmpegPath;
if (os.platform() === "win32") {
  ffmpegPath = path.join(
    process.cwd(),
    "utils",
    "videoconverter",
    "ffmpeg",
    `ffmpeg-2025-09-04-git-2611874a50-full_build`,
    "bin",
    "ffmpeg.exe",
  );
} else {
  // No Linux/Ubuntu, espera-se que ffmpeg esteja no PATH
  ffmpegPath = "ffmpeg";
}

export default ffmpegPath;
