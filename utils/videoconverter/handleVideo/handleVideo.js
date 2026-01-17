import { spawn } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import config from "./../ffmpeg/ffmpegConfig.js";
import ffmpegPath from "./ffmpegPath.js";

const transcode = (inputFileName, output) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  console.log(__dirname);
  const ffmpegArgs = config(inputFileName, output);
  console.log(inputFileName);
  if (!fs.existsSync("./processedFiles/" + inputFileName)) {
    fs.mkdirSync("./processedFiles/" + inputFileName, { recursive: true });
    console.log("Diretório criado: " + "./processedFiles/" + inputFileName);
  } else {
    console.log("Diretório já existe: " + "./processedFiles/" + inputFileName);
  }
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

    ffmpegProcess.stdout.on("data", (data) => {
      console.log("stdout:", data.toString());
    });

    ffmpegProcess.stderr.on("data", (data) => {
      console.log("stderr:", data.toString()); // FFmpeg escreve logs no stderr
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Transcodificação concluída com sucesso");
        resolve({ success: true, outputDir });
      } else {
        console.error("FFmpeg falhou com código:", code);
        reject(new Error("Erro na transcodificação"));
      }
    });
  });
};

export default transcode;
