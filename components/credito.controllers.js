
import db from "../firebase.js";


export const obtenerCreditos = async (req, res) => {
  try {
    const snapshot = await db.collection("creditos").orderBy("fecha", "desc").get();

    const creditos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(creditos);
  } catch (error) {
    console.error("Error al obtener los créditos:", error);

    res.status(500).json({
      mensaje: "Error al obtener los créditos.",
      error: error.message,
    });
  }
};


export const registrarCredito = async (req, res) => {
  try {
    const {
      clienteRef,
      productoRef,
      fecha,
      descripcion,
      montoTotal,
      saldoPendiente,
      estado,
      abonos
    } = req.body || {};


    if (
      !clienteRef ||
      !productoRef ||
      !fecha ||
      !descripcion ||
      montoTotal === undefined ||
      saldoPendiente === undefined ||
      estado === undefined ||
      !abonos
    ) {
      return res.status(400).json({
        mensaje:
          "Todos los campos son obligatorios: cliente, producto, fecha, descripción, monto total, saldo pendiente, estado y abonos.",
      });
    }


    if (typeof estado !== "boolean") {
      return res.status(400).json({
        mensaje:
          "El campo estado debe ser verdadero (cancelado) o falso (pendiente).",
      });
    }


    if (Number(montoTotal) < 0) {
      return res.status(400).json({
        mensaje: "El monto total no puede ser negativo.",
      });
    }


    if (Number(saldoPendiente) < 0) {
      return res.status(400).json({
        mensaje: "El saldo pendiente no puede ser negativo.",
      });
    }


    if (Number(saldoPendiente) > Number(montoTotal)) {
      return res.status(400).json({
        mensaje: "El saldo pendiente no puede ser mayor que el monto total.",
      });
    }


    if (!Array.isArray(abonos)) {
      return res.status(400).json({
        mensaje: "Los abonos deben ser un arreglo.",
      });
    }


    const clienteDoc = await db
      .collection("clientes")
      .doc(clienteRef)
      .get();

    if (!clienteDoc.exists) {
      return res.status(404).json({
        mensaje: "El cliente especificado no existe.",
      });
    }


    const productoDoc = await db
      .collection("productos")
      .doc(productoRef)
      .get();

    if (!productoDoc.exists) {
      return res.status(404).json({
        mensaje: "El producto especificado no existe.",
      });
    }


    for (const abono of abonos) {
      if (
        !abono.fecha ||
        abono.monto === undefined
      ) {
        return res.status(400).json({
          mensaje: "Cada abono debe contener fecha y monto.",
        });
      }


      if (Number(abono.monto) <= 0) {
        return res.status(400).json({
          mensaje: "El monto de cada abono debe ser mayor que cero.",
        });
      }
    }


    const docRef = await db.collection("creditos").add({
      clienteRef,
      productoRef,
      fecha,
      descripcion,
      montoTotal: Number(montoTotal),
      saldoPendiente: Number(saldoPendiente),
      estado,
      abonos: abonos.map((abono) => ({
        fecha: abono.fecha,
        monto: Number(abono.monto),
      })),
    });


    res.status(201).json({
      mensaje: `¡Crédito registrado con éxito! ID: ${docRef.id}`,
      id: docRef.id,
      estado: estado ? "Cancelado" : "Pendiente",
    });

  } catch (error) {
    console.error("Error al registrar el crédito:", error);

    res.status(500).json({
      mensaje: "Error al registrar el crédito.",
      error: error.message,
    });
  }
};


export const actualizarCredito = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      clienteRef,
      productoRef,
      fecha,
      descripcion,
      montoTotal,
      saldoPendiente,
      estado,
      abonos
    } = req.body || {};


    if (
      !clienteRef ||
      !productoRef ||
      !fecha ||
      !descripcion ||
      montoTotal === undefined ||
      saldoPendiente === undefined ||
      estado === undefined ||
      !abonos
    ) {
      return res.status(400).json({
        mensaje:
          "Todos los campos son obligatorios: cliente, producto, fecha, descripción, monto total, saldo pendiente, estado y abonos.",
      });
    }


    if (typeof estado !== "boolean") {
      return res.status(400).json({
        mensaje:
          "El campo estado debe ser verdadero (cancelado) o falso (pendiente).",
      });
    }


    if (Number(montoTotal) < 0) {
      return res.status(400).json({
        mensaje: "El monto total no puede ser negativo.",
      });
    }


    if (Number(saldoPendiente) < 0) {
      return res.status(400).json({
        mensaje: "El saldo pendiente no puede ser negativo.",
      });
    }


    if (Number(saldoPendiente) > Number(montoTotal)) {
      return res.status(400).json({
        mensaje: "El saldo pendiente no puede ser mayor que el monto total.",
      });
    }


    if (!Array.isArray(abonos)) {
      return res.status(400).json({
        mensaje: "Los abonos deben ser un arreglo.",
      });
    }


    const docRef = db.collection("creditos").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        mensaje: "Crédito no encontrado.",
      });
    }


    const clienteDoc = await db
      .collection("clientes")
      .doc(clienteRef)
      .get();

    if (!clienteDoc.exists) {
      return res.status(404).json({
        mensaje: "El cliente especificado no existe.",
      });
    }


    const productoDoc = await db
      .collection("productos")
      .doc(productoRef)
      .get();

    if (!productoDoc.exists) {
      return res.status(404).json({
        mensaje: "El producto especificado no existe.",
      });
    }


    for (const abono of abonos) {
      if (
        !abono.fecha ||
        abono.monto === undefined
      ) {
        return res.status(400).json({
          mensaje: "Cada abono debe contener fecha y monto.",
        });
      }


      if (Number(abono.monto) <= 0) {
        return res.status(400).json({
          mensaje: "El monto de cada abono debe ser mayor que cero.",
        });
      }
    }


    await docRef.update({
      clienteRef,
      productoRef,
      fecha,
      descripcion,
      montoTotal: Number(montoTotal),
      saldoPendiente: Number(saldoPendiente),
      estado,
      abonos: abonos.map((abono) => ({
        fecha: abono.fecha,
        monto: Number(abono.monto),
      })),
    });


    res.status(200).json({
      mensaje: `¡Crédito actualizado con éxito! ID: ${id}`,
      id,
      estado: estado ? "Cancelado" : "Pendiente",
    });

  } catch (error) {
    console.error("Error al actualizar el crédito:", error);

    res.status(500).json({
      mensaje: "Error al actualizar el crédito.",
      error: error.message,
    });
  }
};

