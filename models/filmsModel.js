import mongoose from "mongoose";

const filmSchema = new mongoose.Schema({
  titulo: { type: String },
  descricao: { type: String },
  lancancamento: { type: Number },
  idioma: { type: String },
  categoria: { type: String },
  tags: { type: [String] },
  elenco: { type: [String] },
  diretor: { type: String },
  duracao: { type: Number },
  status: {
    type: String,
    enum: ["pendente", "ativo", "inativo"],
    default: "pendente",
  },
  videopath: { type: String },
});

const Film = mongoose.model("Film", filmSchema);

export default Film;
