
import db from "../firebase.js";


export const obtenerPedidos = async (req, res) => {
  try {
    const snapshot = await db.collection("pedidos").get();

    const pedidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al obtener los pedidos:", error);

    res.status(500).json({
      mensaje: "Error al obtener los pedidos.",
      error: error.message,
    });
  }
};


export const registrarPedido = async (req, res) => {
  try {
    const {
      clienteRef,
      fecha,
      estado,
      total,
      metodoPago,
      detalles
    } = req.body || {};


    if (
      !clienteRef ||
      !fecha ||
      estado === undefined ||
      total === undefined ||
      metodoPago === undefined ||
      !detalles
    ) {
      return res.status(400).json({
        mensaje:
          "Todos los campos son obligatorios: cliente, fecha, estado, total, método de pago y detalles.",
      });
    }


    if (typeof estado !== "boolean") {
      return res.status(400).json({
        mensaje:
          "El campo estado debe ser verdadero (completado) o falso (en proceso).",
      });
    }


    if (typeof metodoPago !== "boolean") {
      return res.status(400).json({
        mensaje:
          "El método de pago debe ser verdadero (efectivo) o falso (tarjeta).",
      });
    }


    if (Number(total) < 0) {
      return res.status(400).json({
        mensaje: "El total no puede ser negativo.",
      });
    }


    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        mensaje: "El pedido debe contener al menos un detalle.",
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


    for (const detalle of detalles) {
      if (
        !detalle.productoRef ||
        detalle.cantidad === undefined ||
        detalle.precio === undefined ||
        detalle.subtotal === undefined
      ) {
        return res.status(400).json({
          mensaje:
            "Cada detalle debe contener productoRef, cantidad, precio y subtotal.",
        });
      }


      if (Number(detalle.cantidad) <= 0) {
        return res.status(400).json({
          mensaje: "La cantidad de cada producto debe ser mayor que cero.",
        });
      }


      if (Number(detalle.precio) < 0) {
        return res.status(400).json({
          mensaje: "El precio de cada producto no puede ser negativo.",
        });
      }


      if (Number(detalle.subtotal) < 0) {
        return res.status(400).json({
          mensaje: "El subtotal no puede ser negativo.",
        });
      }


      const productoDoc = await db
        .collection("productos")
        .doc(detalle.productoRef)
        .get();

      if (!productoDoc.exists) {
        return res.status(404).json({
          mensaje: `El producto ${detalle.productoRef} no existe.`,
        });
      }
    }


    const docRef = await db.collection("pedidos").add({
      clienteRef,
      fecha,
      estado,
      total: Number(total),
      metodoPago,
      detalles: detalles.map((detalle) => ({
        productoRef: detalle.productoRef,
        cantidad: Number(detalle.cantidad),
        precio: Number(detalle.precio),
        subtotal: Number(detalle.subtotal),
      })),
    });


    res.status(201).json({
      mensaje: `¡Pedido registrado con éxito! ID: ${docRef.id}`,
      id: docRef.id,
      estado: estado ? "Completado" : "En proceso",
      metodoPago: metodoPago ? "Efectivo" : "Tarjeta",
    });

  } catch (error) {
    console.error("Error al registrar el pedido:", error);

    res.status(500).json({
      mensaje: "Error al registrar el pedido.",
      error: error.message,
    });
  }
};


export const actualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      clienteRef,
      fecha,
      estado,
      total,
      metodoPago,
      detalles
    } = req.body || {};


    if (
      !clienteRef ||
      !fecha ||
      estado === undefined ||
      total === undefined ||
      metodoPago === undefined ||
      !detalles
    ) {
      return res.status(400).json({
        mensaje:
          "Todos los campos son obligatorios: cliente, fecha, estado, total, método de pago y detalles.",
      });
    }


    if (typeof estado !== "boolean") {
      return res.status(400).json({
        mensaje:
          "El campo estado debe ser verdadero (completado) o falso (en proceso).",
      });
    }


    if (typeof metodoPago !== "boolean") {
      return res.status(400).json({
        mensaje:
          "El método de pago debe ser verdadero (efectivo) o falso (tarjeta).",
      });
    }


    if (Number(total) < 0) {
      return res.status(400).json({
        mensaje: "El total no puede ser negativo.",
      });
    }


    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        mensaje: "El pedido debe contener al menos un detalle.",
      });
    }


    const docRef = db.collection("pedidos").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado.",
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


    for (const detalle of detalles) {
      if (
        !detalle.productoRef ||
        detalle.cantidad === undefined ||
        detalle.precio === undefined ||
        detalle.subtotal === undefined
      ) {
        return res.status(400).json({
          mensaje:
            "Cada detalle debe contener productoRef, cantidad, precio y subtotal.",
        });
      }


      if (Number(detalle.cantidad) <= 0) {
        return res.status(400).json({
          mensaje: "La cantidad de cada producto debe ser mayor que cero.",
        });
      }


      if (Number(detalle.precio) < 0) {
        return res.status(400).json({
          mensaje: "El precio de cada producto no puede ser negativo.",
        });
      }


      if (Number(detalle.subtotal) < 0) {
        return res.status(400).json({
          mensaje: "El subtotal no puede ser negativo.",
        });
      }


      const productoDoc = await db
        .collection("productos")
        .doc(detalle.productoRef)
        .get();

      if (!productoDoc.exists) {
        return res.status(404).json({
          mensaje: `El producto ${detalle.productoRef} no existe.`,
        });
      }
    }


    await docRef.update({
      clienteRef,
      fecha,
      estado,
      total: Number(total),
      metodoPago,
      detalles: detalles.map((detalle) => ({
        productoRef: detalle.productoRef,
        cantidad: Number(detalle.cantidad),
        precio: Number(detalle.precio),
        subtotal: Number(detalle.subtotal),
      })),
    });


    res.status(200).json({
      mensaje: `¡Pedido actualizado con éxito! ID: ${id}`,
      id,
      estado: estado ? "Completado" : "En proceso",
      metodoPago: metodoPago ? "Efectivo" : "Tarjeta",
    });

  } catch (error) {
    console.error("Error al actualizar el pedido:", error);

    res.status(500).json({
      mensaje: "Error al actualizar el pedido.",
      error: error.message,
    });
  }
};
