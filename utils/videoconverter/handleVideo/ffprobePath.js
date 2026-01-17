import path from "path";
import os from "os";

const ffprobePath = () => {
  if (os.platform() === "win32") {
    return path.join(
      process.cwd(),
      "utils",
      "videoconverter",
      "ffmpeg",
      `ffmpeg-2025-09-04-git-2611874a50-full_build`,
      "bin",
      "ffprobe.exe",
    );
  } else {
    // No Linux/Ubuntu, espera-se que ffprobe esteja no PATH
    return "ffprobe";
  }
};

export default ffprobePath;
