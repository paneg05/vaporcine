import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import path from "path";
import { validateUploadFields } from "../validators/uploadValidator.js";
import transcode from "../utils/videoconverter/handleVideo/handleVideo.js";
import filmsModel from "../models/filmsModel.js";
import mongoose from "mongoose";
import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export const handleUpload = async (request, reply) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  try {
    const titulo = request.query.titulo;

    console.log(titulo);

    if (!titulo) {
      return reply
        .status(400)
        .send({ error: "Título não fornecido via query string" });
    }
    const tituloExisting = await filmsModel.findOne({ titulo: titulo });

    if (tituloExisting) {
      console.log(tituloExisting);
      return reply.status(400).send({ error: "Título já existe" });
    }
    const renameFileAsync = promisify(fs.rename);

    const uploadDir = join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    const pipelineAsync = promisify(pipeline);
    const parts = request.parts();
    const fields = {};
    let fileNameToTranscode = "";

    for await (const part of parts) {
      if (part.file) {
        // Skip empty or invalid file uploads
        if (
          !part.filename ||
          part.file.truncated ||
          part.file.bytesRead === 0
        ) {
          continue;
        }
        const filename = path.basename(part.filename);
        const filePath = path.join(uploadDir, filename);
        if (
          part.mimetype !== "video/mp4" &&
          part.mimetype !== "image/jpeg" &&
          part.mimetype !== "video/x-matroska" &&
          part.mimetype !== "image/png"
        ) {
          return reply
            .status(400)
            .send({ error: "Formato de arquivo inválido" });
        }
        try {
          await pipelineAsync(part.file, fs.createWriteStream(filePath)).catch(
            (err) => {
              console.error(`Erro ao salvar ${filename}:`, err);
              throw err;
            },
          );
          console.log(`Arquivo salvo: ${filename}`);
          if (part.mimetype.includes("video")) {
            fileNameToTranscode = filename;
          }
        } catch (err) {
          // Already logged above
          return reply.status(500).send({ error: "Falha ao salvar arquivo" });
        }
      } else {
        fields[part.fieldname] = part.value;
      }
    }
    const validation = validateUploadFields(fields);

    if (!validation.isValid) {
      return reply.status(400).send({ error: validation.errors });
    }

    await renameFileAsync(
      path.join(uploadDir, fileNameToTranscode),
      path.join(uploadDir, fields.titulo + path.extname(fileNameToTranscode)),
    );
    const newFilm = new filmsModel({
      ...fields,
      status: "pendente",
      videopath: path.join(
        uploadDir,
        fields.titulo + path.extname(fileNameToTranscode),
      ),
    });
    const teste = await newFilm.save();

    /**

    


    
    
   
    

   

    const output = "./processedFiles/" + fileNameToTranscode + "/";

    //await transcode(fileNameToTranscode, output).then((result) => {
    //  filmsModel.findByIdAndUpdate(newFilm._id, { status: "ativo" });
    //});
*/
    return reply.send({
      message: "Upload e dados recebidos com sucesso!",
    });
  } catch (err) {
    console.error("Erro no upload:", err);
    return reply.status(500).send({ error: "Falha no upload" });
  }
};
