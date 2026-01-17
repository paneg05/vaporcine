import TagsModel from "../../models/tagsModel.js";
import mongoose from "mongoose";

export const getAllTags = async (request, reply) => {
  try {
    const id = process.env.ALL_TAGS_ID;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(500).send({ message: "Error fetching tags" });
    }

    const tags = await TagsModel.findById(id).exec();
    console.log(tags);
    if (!tags) {
      return reply.code(404).send({ message: "Tags not found" });
    }
    return reply.send(tags);
  } catch (error) {
    console.error(error);

    return reply.code(500).send({ message: "Error fetching tags" });
  }
};
