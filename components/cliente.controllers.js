
import db from "../firebase.js";


export const obtenerClientes = async (req, res) => {
  try {
    const snapshot = await db.collection("clientes").get();

    const clientes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(clientes);
  } catch (error) {
    console.error("Error al obtener los clientes:", error);

    res.status(500).json({
      mensaje: "Error al obtener los clientes.",
      error: error.message,
    });
  }
};


export const registrarCliente = async (req, res) => {
  try {
    const { nombre, telefono, direccion, estado } = req.body || {};

    if (!nombre || !telefono || !direccion || estado === undefined) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios: nombre, teléfono, dirección y estado.",
      });
    }

    if (typeof estado !== "boolean") {
      return res.status(400).json({
        mensaje: "El campo estado debe ser verdadero (activo) o falso (inactivo).",
      });
    }

    const docRef = await db.collection("clientes").add({
      nombre,
      telefono,
      direccion,
      estado,
    });

    res.status(201).json({
      mensaje: `¡Cliente registrado con éxito! ID: ${docRef.id} | Nombre: ${nombre}`,
      id: docRef.id,
      estado: estado ? "Activo" : "Inactivo",
    });

  } catch (error) {
    console.error("Error al registrar el cliente:", error);

    res.status(500).json({
      mensaje: "Error al registrar el cliente.",
      error: error.message,
    });
  }
};


export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, direccion, estado } = req.body || {};

    if (!nombre || !telefono || !direccion || estado === undefined) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios: nombre, teléfono, dirección y estado.",
      });
    }

    if (typeof estado !== "boolean") {
      return res.status(400).json({
        mensaje: "El campo estado debe ser verdadero (activo) o falso (inactivo).",
      });
    }

    const docRef = db.collection("clientes").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado.",
      });
    }

    await docRef.update({
      nombre,
      telefono,
      direccion,
      estado,
    });

    res.status(200).json({
      mensaje: `¡Cliente actualizado con éxito! ID: ${id} | Nombre: ${nombre}`,
      id,
      estado: estado ? "Activo" : "Inactivo",
    });

  } catch (error) {
    console.error("Error al actualizar el cliente:", error);

    res.status(500).json({
      mensaje: "Error al actualizar el cliente.",
      error: error.message,
    });
  }
};
