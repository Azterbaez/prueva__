import db from "../firebase.js";
import supabase from "../supabase.js";


export const obtenerCategorias = async (req, res) => {
  try {
    const snapshot = await db.collection("categorias").get();
    const categorias = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    res.status(500).json({
      mensaje: "Error al obtener las categorías.",
      error: error.message,
    });
  }
};


export const registrarCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body || {};
    const imagen = req.file;

    if (!nombre || !descripcion) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios: nombre y descripción.",
      });
    }

    if (!imagen) {
      return res.status(400).json({
        mensaje: "La imagen de la categoría es obligatoria.",
      });
    }

    if (!imagen.mimetype.startsWith("image/")) {
      return res.status(400).json({
        mensaje: "El archivo debe ser una imagen.",
      });
    }


    const extension = imagen.originalname.split(".").pop().toLowerCase();

    const nombreArchivo = `categoria-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const rutaImagen = `categorias/${nombreArchivo}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes_categorias")
      .upload(rutaImagen, imagen.buffer, {
        contentType: imagen.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir imagen:", uploadError);

      return res.status(500).json({
        mensaje: "Error al subir la imagen a Supabase.",
        error: uploadError.message,
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("imagenes_categorias")
      .getPublicUrl(rutaImagen);

    const imagenUrl = publicUrlData.publicUrl;

    const docRef = await db.collection("categorias").add({
      nombre,
      descripcion,
      imagenUrl,
      fecha: new Date().toISOString(),
    });

    res.status(201).json({
      mensaje: `¡Categoría registrada con éxito! ID: ${docRef.id} | Nombre: ${nombre} | Descripción: ${descripcion}`,
      id: docRef.id,
      imagenUrl,
    });


  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      mensaje: "Error al registrar la categoría.",
      error: error.message,
    });
  }

};


export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body || {};
    const imagen = req.file;

    if (!nombre || !descripcion) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios: nombre y descripción.",
      });
    }

    const docRef = db.collection("categorias").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        mensaje: "Categoría no encontrada.",
      });
    }

    let imagenUrl = doc.data().imagenUrl;

    if (imagen) {
      if (!imagen.mimetype.startsWith("image/")) {
        return res.status(400).json({
          mensaje: "El archivo debe ser una imagen.",
        });
      }

      const extension = imagen.originalname.split(".").pop().toLowerCase();

      const nombreArchivo = `categoria-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extension}`;
        const rutaImagen = `categorias/${nombreArchivo}`;

        const { error: uploadError } = await supabase.storage
          .from("imagenes_categorias")
          .upload(rutaImagen, imagen.buffer, {
            contentType: imagen.mimetype,
            upsert: false,
          });

          if (uploadError) {
            console.error("Error al subir imagen:", uploadError);
            return res.status(500).json({
              mensaje: "Error al subir la imagen a Supabase.",
              error: uploadError.message,
            });
          }

          const { data: publicUrlData } = supabase.storage
            .from("imagenes_categorias")
            .getPublicUrl(rutaImagen);

            imagenUrl = publicUrlData.publicUrl;
          }

          await docRef.update({
            nombre,
            descripcion,
            imagenUrl,
          });

          res.status(200).json({
            mensaje: `¡Categoría actualizada con éxito! ID: ${id} | Nombre: ${nombre} | Descripción: ${descripcion}`,
            id,
            imagenUrl,
          });
        } catch (error) {
          console.error("Error al actualizar la categoría:", error);
          res.status(500).json({
            mensaje: "Error al actualizar la categoría.",
            error: error.message,
          });
        }
      };
