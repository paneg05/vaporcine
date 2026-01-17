import { getAllTags } from "../../controllers/tags/getAllTagsController.js";

const tagsRout = (app) => {
  app.get("/tags", getAllTags);
};

export default tagsRout;
