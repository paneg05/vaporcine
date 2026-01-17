export const validateUploadFields = (fields) => {
  const errors = [];

  if (!fields.titulo || fields.titulo.trim().length < 3) {
    errors.push(
      "O campo 'titulo' é obrigatório e deve ter pelo menos 3 caracteres."
    );
  }

  if (!fields.descricao || fields.descricao.trim().length < 10) {
    errors.push(
      "O campo 'descricao' é obrigatório e deve ter pelo menos 10 caracteres."
    );
  }

  if (!fields.categoria || fields.categoria.trim().length === 0) {
    errors.push("O campo 'categoria' é obrigatório.");
  }

  let tags = [];
  if (fields.tags) {
    try {
      tags = JSON.parse(fields.tags);
      if (!Array.isArray(tags)) {
        errors.push("O campo 'tags' deve ser um array.");
      }
    } catch (e) {
      errors.push("O campo 'tags' deve ser um JSON válido.");
    }
  } else {
    errors.push("O campo 'tags' é obrigatório.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedFields: {
      titulo: fields.titulo ? fields.titulo.trim() : null,
      descricao: fields.descricao ? fields.descricao.trim() : null,
      categoria: fields.categoria ? fields.categoria.trim() : null,
      tags,
    },
  };
};
export const uploadSchema = {
  body: {
    type: "object",
    required: ["titulo", "descricao", "categoria", "tags"],
    properties: {
      titulo: {
        type: "string",
        minLength: 3,
      },
      descricao: {
        type: "string",
        minLength: 10,
      },
      categoria: {
        type: "string",
      },
      tags: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  },
};
