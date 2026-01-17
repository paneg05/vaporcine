import { join } from "path";

const config = (inputFileName, output) => {
  const input = join(process.cwd(), "uploads", inputFileName);
  const outDir = `${output}`; // ex.: "./processedFiles/<arquivo>/"
  const masterName = "master.m3u8";

  const filterComplex = [
    `[0:v]split=5[v1080][v720][v540][v360][v240]`,
    `[v1080]scale=-2:1080:flags=bicubic,setsar=1[v1080out]`,
    `[v720] scale=-2:720:flags=bicubic,setsar=1[v720out]`,
    `[v540] scale=-2:540:flags=bicubic,setsar=1[v540out]`,
    `[v360] scale=-2:360:flags=bicubic,setsar=1[v360out]`,
    `[v240] scale=-2:240:flags=bicubic,setsar=1[v240out]`,
  ].join(";");

  // Um áudio para cada variant (a:0..a:4) — evita o erro “Same elementary stream...”
  const args = [
    "-y",
    "-i",
    input,
    "-filter_complex",
    filterComplex,

    // Vídeos (ordem define v:0..v:4)
    "-map",
    "[v1080out]",
    "-map",
    "[v720out]",
    "-map",
    "[v540out]",
    "-map",
    "[v360out]",
    "-map",
    "[v240out]",

    // Áudios (duplicados para formar a:0..a:4)
    "-map",
    "0:a:0",
    "-map",
    "0:a:0",
    "-map",
    "0:a:0",
    "-map",
    "0:a:0",
    "-map",
    "0:a:0",

    // Codecs vídeo (AMF) e áudio (AAC)
    "-c:v",
    "h264_amf",
    "-pix_fmt",
    "yuv420p",
    "-quality",
    "quality",
    "-usage",
    "transcoding",
    "-profile:v",
    "high",
    "-level:v",
    "4.1",

    // Bitrates por variante (v:0..v:4)
    "-b:v:0",
    "5800k",
    "-maxrate:v:0",
    "5800k",
    "-bufsize:v:0",
    "11600k",
    "-b:v:1",
    "3000k",
    "-maxrate:v:1",
    "3000k",
    "-bufsize:v:1",
    "6000k",
    "-b:v:2",
    "1800k",
    "-maxrate:v:2",
    "1800k",
    "-bufsize:v:2",
    "3600k",
    "-b:v:3",
    "1000k",
    "-maxrate:v:3",
    "1000k",
    "-bufsize:v:3",
    "2000k",
    "-b:v:4",
    "600k",
    "-maxrate:v:4",
    "600k",
    "-bufsize:v:4",
    "1200k",

    // Áudio para cada saída (a:0..a:4)
    "-c:a:0",
    "aac",
    "-ac:a:0",
    "2",
    "-ar:a:0",
    "48000",
    "-b:a:0",
    "128k",
    "-c:a:1",
    "aac",
    "-ac:a:1",
    "2",
    "-ar:a:1",
    "48000",
    "-b:a:1",
    "128k",
    "-c:a:2",
    "aac",
    "-ac:a:2",
    "2",
    "-ar:a:2",
    "48000",
    "-b:a:2",
    "128k",
    "-c:a:3",
    "aac",
    "-ac:a:3",
    "2",
    "-ar:a:3",
    "48000",
    "-b:a:3",
    "128k",
    "-c:a:4",
    "aac",
    "-ac:a:4",
    "2",
    "-ar:a:4",
    "48000",
    "-b:a:4",
    "128k",

    // Keyframes estáveis (4s)
    "-force_key_frames",
    "expr:gte(t,n_forced*4)",

    // HLS
    "-f",
    "hls",
    "-hls_time",
    "4",
    "-hls_playlist_type",
    "vod",
    "-hls_flags",
    "independent_segments",
    "-hls_segment_filename",
    `${outDir}%v/chunk-%03d.ts`,

    // Master com múltiplas variantes (casando v:N com a:N)
    "-master_pl_name",
    masterName,
    "-var_stream_map",
    [
      "v:0,a:0,name:1080p",
      "v:1,a:1,name:720p",
      "v:2,a:2,name:540p",
      "v:3,a:3,name:360p",
      "v:4,a:4,name:240p",
    ].join(" "),

    // Media playlists
    `${outDir}%v/index.m3u8`,
  ];

  return args;
};

export default config;
