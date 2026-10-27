import express from "express";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js";
import {
  registrarPedido,
  obtenerPedidos,
  actualizarPedido
} from "../components/pedido.controllers.js";

const router = express.Router();
router.use(capturarInfoSolicitud);

router.post(

  "/pedido",

  registrarPedido

);

router.put(

  "/pedido/:id",

  actualizarPedido

);

router.get(

  "/pedidos",

  obtenerPedidos

);

export default router;