import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({});

const TagsModel = mongoose.model("tags", tagSchema);

export default TagsModel;
