import db from "../firebase.js";
import supabase from "../supabase.js";
import { guardarAuditoria } from "../utils/auditoria.js";
import { enviarListadoProductos } from "../utils/emailjs.js";

const extraerRutaImagen = (imagenUrl) => {
  if (!imagenUrl) return null;
  const marker = "/imagenes_productos/";
  const idx = imagenUrl.indexOf(marker);
  if (idx === -1) return null;
  return imagenUrl.slice(idx + marker.length);
};

const convertirEstado = (estado) => {
  if (estado === "true") return true;
  if (estado === "false") return false;
  return estado;
};

export const obtenerProductos = async (req, res) => {
  try {
    const snapshot = await db.collection("productos").get();

    const productos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener los productos:", error);

    res.status(500).json({
      mensaje: "Error al obtener los productos.",
      error: error.message,
    });
  }
};


export const registrarProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      stock,
      categoriaRef,
      estado: estadoEnviado
    } = req.body || {};
    const estado = convertirEstado(estadoEnviado);

    const imagen = req.file;

    if (
      !nombre ||
      !descripcion ||
      precio === undefined ||
      stock === undefined ||
      !categoriaRef ||
      estado === undefined
    ) {
      return res.status(400).json({
        mensaje:
          "Todos los campos son obligatorios: nombre, descripción, precio, stock, categoría y estado.",
      });
    }

    if (typeof estado !== "boolean") {
      return res.status(400).json({
        mensaje:
          "El campo estado debe ser verdadero (activo) o falso (inactivo).",
      });
    }

    if (Number(precio) < 0) {
      return res.status(400).json({
        mensaje: "El precio no puede ser negativo.",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        mensaje: "El stock no puede ser negativo.",
      });
    }

    if (!imagen) {
      return res.status(400).json({
        mensaje: "La imagen del producto es obligatoria.",
      });
    }

    if (!imagen.mimetype.startsWith("image/")) {
      return res.status(400).json({
        mensaje: "El archivo debe ser una imagen.",
      });
    }


    const categoriaDoc = await db
      .collection("categorias")
      .doc(categoriaRef)
      .get();

    if (!categoriaDoc.exists) {
      return res.status(404).json({
        mensaje: "La categoría especificada no existe.",
      });
    }


    const extension = imagen.originalname.split(".").pop().toLowerCase();

    const nombreArchivo = `producto-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const rutaImagen = `productos/${nombreArchivo}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes_productos")
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
      .from("imagenes_productos")
      .getPublicUrl(rutaImagen);

    const imagenUrl = publicUrlData.publicUrl;


    const docRef = await db.collection("productos").add({
      nombre,
      descripcion,
      precio: Number(precio),
      imagenUrl,
      stock: Number(stock),
      categoriaRef,
      estado,
      fecha: new Date().toISOString(),
    });

    await guardarAuditoria({
      accion: "crear",
      entidad: "producto",
      entidadId: docRef.id,
      valoresNuevos: {
        nombre,
        descripcion,
        precio: Number(precio),
        stock: Number(stock),
        categoriaRef,
        estado,
        imagenUrl,
      },
      req,
    });

    res.status(201).json({
      mensaje: `¡Producto registrado con éxito! ID: ${docRef.id} | Nombre: ${nombre}`,
      id: docRef.id,
      imagenUrl,
      estado: estado ? "Activo" : "Inactivo",
    });

  } catch (error) {
    console.error("Error al registrar el producto:", error);

    res.status(500).json({
      mensaje: "Error al registrar el producto.",
      error: error.message,
    });
  }
};


export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      descripcion,
      precio,
      stock,
      categoriaRef,
      estado: estadoEnviado
    } = req.body || {};
    const estado = convertirEstado(estadoEnviado);

    const imagen = req.file;

    if (
      !nombre ||
      !descripcion ||
      precio === undefined ||
      stock === undefined ||
      !categoriaRef ||
      estado === undefined
    ) {
      return res.status(400).json({
        mensaje:
          "Todos los campos son obligatorios: nombre, descripción, precio, stock, categoría y estado.",
      });
    }

    if (typeof estado !== "boolean") {
      return res.status(400).json({
        mensaje:
          "El campo estado debe ser verdadero (activo) o falso (inactivo).",
      });
    }

    if (Number(precio) < 0) {
      return res.status(400).json({
        mensaje: "El precio no puede ser negativo.",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        mensaje: "El stock no puede ser negativo.",
      });
    }


    const docRef = db.collection("productos").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        mensaje: "Producto no encontrado.",
      });
    }


    const categoriaDoc = await db
      .collection("categorias")
      .doc(categoriaRef)
      .get();

    if (!categoriaDoc.exists) {
      return res.status(404).json({
        mensaje: "La categoría especificada no existe.",
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

      const nombreArchivo = `producto-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extension}`;

      const rutaImagen = `productos/${nombreArchivo}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes_productos")
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
        .from("imagenes_productos")
        .getPublicUrl(rutaImagen);

      imagenUrl = publicUrlData.publicUrl;
    }


    const valoresNuevos = {
      nombre,
      descripcion,
      precio: Number(precio),
      imagenUrl,
      stock: Number(stock),
      categoriaRef,
      estado,
    };

    await docRef.update(valoresNuevos);

    await guardarAuditoria({
      accion: "actualizar",
      entidad: "producto",
      entidadId: id,
      valoresAnteriores: doc.data(),
      valoresNuevos,
      req,
    });

    res.status(200).json({
      mensaje: `¡Producto actualizado con éxito! ID: ${id} | Nombre: ${nombre}`,
      id,
      imagenUrl,
      estado: estado ? "Activo" : "Inactivo",
    });

  } catch (error) {
    console.error("Error al actualizar el producto:", error);

    res.status(500).json({
      mensaje: "Error al actualizar el producto.",
      error: error.message,
    });
  }
};

export const buscarProductos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        mensaje: "Debes enviar un término de búsqueda (parámetro q).",
      });
    }

    const termino = q.trim().toLowerCase();
    const snapshot = await db.collection("productos").orderBy("fecha", "desc").get();

    const productos = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((p) => {
        const nombre = String(p.nombre || "").toLowerCase();
        const descripcion = String(p.descripcion || "").toLowerCase();
        const categoria = String(p.categoriaRef || "").toLowerCase();
        const precio = String(p.precio ?? "");
        const stock = String(p.stock ?? "");

        return (
          nombre.includes(termino) ||
          descripcion.includes(termino) ||
          categoria.includes(termino) ||
          precio.includes(termino) ||
          stock.includes(termino)
        );
      });

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({
      mensaje: "Error al buscar los productos.",
      error: error.message,
    });
  }
};

export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("productos").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        mensaje: "Producto no encontrado.",
      });
    }

    const datosAnteriores = doc.data();
    const rutaImagen = extraerRutaImagen(datosAnteriores.imagenUrl);

    if (rutaImagen) {
      const { error: deleteError } = await supabase.storage
        .from("imagenes_productos")
        .remove([rutaImagen]);

      if (deleteError) {
        console.error("Error al eliminar imagen:", deleteError);
      }
    }

    await docRef.delete();

    await guardarAuditoria({
      accion: "eliminar",
      entidad: "producto",
      entidadId: id,
      valoresAnteriores: datosAnteriores,
      req,
    });

    res.status(200).json({
      mensaje: `Producto eliminado correctamente. ID: ${id}`,
      id,
    });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({
      mensaje: "Error al eliminar el producto.",
      error: error.message,
    });
  }
};

export const enviarProductosPorEmail = async (req, res) => {
  try {
    const snapshot = await db.collection("productos").orderBy("fecha", "desc").get();
    const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    await enviarListadoProductos(productos);

    res.status(200).json({
      mensaje: `Se envió el listado de ${productos.length} producto(s) por correo.`,
      total: productos.length,
    });
  } catch (error) {
    console.error("Error al enviar productos por email:", error);
    res.status(500).json({
      mensaje: "Error al enviar el listado de productos por correo.",
      error: error.message,
    });
  }
};
