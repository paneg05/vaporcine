import { handleUpload } from "../../controllers/uploadController.js";
import { uploadSchema } from "../../validators/uploadValidator.js";
const Upload = async (app) => {
  app.post("/api/upload", async (request, reply) => {
    await handleUpload(request, reply);
  });
};

export default Upload;
