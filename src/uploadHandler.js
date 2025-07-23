import Busboy from "busboy";
import { logger, pipelineAsync } from "./util.js";
import path from "path";
import { join } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";
const ON_FILE_UPLOADED = "file-uploaded";
class UploadHandler {
  #io;
  #socketId;
  constructor(io, socketId) {
    this.#io = io;
    this.#socketId = socketId;
  }
  getCurrentPath() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    return __dirname;
  }
  registerEvents(headers, onFinish) {
    const busboy = Busboy({ headers });

    busboy.on("file", this.#onFile.bind(this));
    busboy.on("finish", onFinish);
    return busboy;
  }
  #handleFileBytes(filename) {
    async function* handleData(data) {
      for await (const item of data) {
        const size = item.length;

        this.#io?.to(this.#socketId)?.emit(ON_FILE_UPLOADED, size);
        yield item;
      }
    }
    return handleData.bind(this);
  }
  async #onFile(fieldname, file, filename) {
    logger.info(`filename ${filename.filename}`);
    let __dirname = this.getCurrentPath();
    console.log();
    const saveFileTo = join(__dirname, "../", "downloads", filename.filename);

    logger.info("uploading" + saveFileTo);
    await pipelineAsync(
      file,
      this.#handleFileBytes.apply(this, [filename]),
      createWriteStream(saveFileTo)
    );
    logger.info(`File [${filename.filename}] finished!`);
  }
}

export default UploadHandler;
