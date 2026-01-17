import path from "path";
import filmsModel from "../models/filmsModel.js";
import ffprobePath from "../utils/videoconverter/handleVideo/ffprobePath.js";
import ffmpegPath from "../utils/videoconverter/handleVideo/ffmpegPath.js";
import { spawn } from "child_process";
import ffmpegResolutionArgs from "../utils/videoconverter/ffmpeg/ffmpegResolutionArgs.js";
import ffprobeArgs from "../utils/videoconverter/ffmpeg/ffprobeArgs.js";
import ffpromisseWrapper from "../utils/ffPromisseWrapper.js";
import ffmpegConfig from "../utils/videoconverter/ffmpeg/ffmpegConfig.js";
import fs from "fs";
import { uploadFolder } from "../utils/storage/uploadTofireBase.js";
const videoProcessor = async () => {
  const filmsToProcess = await filmsModel.find({ status: "pendente" });
  for (const film of filmsToProcess) {
    const outputFile = path.join(
      process.cwd(),
      "uploads",
      `padded_${path.basename(film.videopath)}`
    );
    console.log(`Processando vídeo: ${film.titulo}`);
    await film.save();
    const inputFile = film.videopath;
    console.log(inputFile);

    try {
      const skipTranscode =
        process.env.SKIP_TRANSCODE === "1" ||
        String(process.env.SKIP_TRANSCODE).toLowerCase() === "true";
      const ffprobeCmd =
        typeof ffprobePath === "function" ? ffprobePath() : ffprobePath;
      console.log(
        `Starting ffprobe for ${inputFile} -> ${ffprobeCmd} ${ffprobeArgs(
          inputFile
        ).join(" ")}`
      );
      const ffprobeResult = await ffpromisseWrapper(
        ffprobeCmd,
        ffprobeArgs(inputFile)
      );
      console.log(
        `Finished ffprobe for ${inputFile} (exit ${ffprobeResult.code})`
      );
      console.log(`ffprobe stdout: ${ffprobeResult.stdout}`);
      console.log(`ffprobe stderr: ${ffprobeResult.stderr}`);

      if (!skipTranscode && ffprobeResult.stdout.includes("1920x816")) {
        const ffmpegCmd =
          typeof ffmpegPath === "function" ? ffmpegPath() : ffmpegPath;
        console.log(
          `Starting ffmpeg for ${inputFile} -> ${ffmpegCmd} ${ffmpegResolutionArgs(
            inputFile,
            outputFile
          ).join(" ")}`
        );
        const ffmpegResult = await ffpromisseWrapper(
          ffmpegCmd,
          ffmpegResolutionArgs(inputFile, outputFile)
        );
        console.log(
          `Finished ffmpeg for ${inputFile} (exit ${ffmpegResult.code})`
        );
        if (ffmpegResult.stdout)
          console.log(`ffmpeg stdout: ${ffmpegResult.stdout}`);
        if (ffmpegResult.stderr)
          console.error(`ffmpeg stderr: ${ffmpegResult.stderr}`);
        if (ffmpegResult.code === 0) {
          console.log("✅ Conversão concluída com sucesso!");
          await fs.unlink(inputFile, (err) => {
            if (err) {
              console.error(
                `Erro ao deletar o arquivo original ${inputFile}:`,
                err
              );
            } else {
              console.log(
                `Arquivo original ${inputFile} deletado com sucesso.`
              );
            }
          });
          await fs.rename(outputFile, inputFile, (err) => {
            if (err) {
              console.error(
                `Erro ao renomear o arquivo convertido ${outputFile} para ${inputFile}:`,
                err
              );
            } else {
              console.log(
                `Arquivo convertido renomeado de ${outputFile} para ${inputFile} com sucesso.`
              );
            }
          });
        } else {
          console.error(`❌ FFmpeg finalizou com código ${ffmpegResult.code}`);
        }
      } else if (skipTranscode) {
        console.log("SKIP_TRANSCODE set — pulando etapa de transcodificação.");
      }
      // Run HLS packaging (ffmpegConfig returns the args array).
      // ffPromisseWrapper expects (cmd, argsArray).
      const ffmpegCmd2 =
        typeof ffmpegPath === "function" ? ffmpegPath() : ffmpegPath;
      // Use a processedFiles/<basename>/ directory for HLS outputs
      const outDir = path.join(
        process.cwd(),
        "processedFiles",
        path.parse(inputFile).name,
        "/"
      );
      const masterPath = path.join(outDir, "master.m3u8");
      try {
        await fs.promises.mkdir(outDir, { recursive: true });
      } catch (e) {
        console.warn(`Could not create outDir ${outDir}:`, e.message || e);
      }

      if (fs.existsSync(masterPath)) {
        console.log("Found existing HLS outputs — skipping packaging.");
      } else {
        const dashArgs = ffmpegConfig(path.basename(inputFile), outDir);
        console.log(
          `Starting ffmpeg (HLS) -> ${ffmpegCmd2} ${dashArgs.join(" ")}`
        );
        const ffmpegdash = await ffpromisseWrapper(ffmpegCmd2, dashArgs);
        console.log(`Finished ffmpeg (HLS) (exit ${ffmpegdash.code})`);
        if (ffmpegdash.stderr)
          console.error(`ffmpeg HLS stderr: ${ffmpegdash.stderr}`);
      }
      const remotePrefix = `processedFiles/${path.parse(inputFile).name}`;
      const results = await uploadFolder(outDir, remotePrefix, {
        makePublic: true,
        concurrency: 12,
        retries: 5,
      });
      // log a short summary of upload results
      const successes = results.filter((r) => r.url).length;
      const failures = results.filter((r) => r.error).length;
      console.log(
        `Upload summary: ${successes} succeeded, ${failures} failed (${results.length} total)`
      );

      // update film status to 'ativo' if all uploads succeeded
      try {
        if (failures === 0) {
          film.status = "ativo";
          await film.save();
          console.log(`Film ${film.titulo} status updated to 'ativo'`);
        } else {
          console.warn(
            `Not updating status to 'ativo' because ${failures} files failed to upload.`
          );
        }
      } catch (dbErr) {
        console.error("Failed to update film status:", dbErr);
      }
    } catch (error) {
      console.error("Erro ao processar o vídeo:", error);
    }
  }
};

export default videoProcessor;
