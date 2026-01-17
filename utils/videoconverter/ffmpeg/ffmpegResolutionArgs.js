const ffmpegResolutionArgs = (inputFile, outputFile) => [
  // overwrite output files by default
  "-y",
  "-i",
  inputFile,
  "-vf",
  "pad=1920:1080:0:132:black,format=yuv420p",
  "-c:v",
  "h264_amf",
  "-quality",
  "balanced",
  "-b:v",
  "2500k",
  "-maxrate",
  "3000k",
  "-bufsize",
  "5000k",
  "-c:a",
  "copy",
  outputFile,
];

export default ffmpegResolutionArgs;
