import express from "express";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js";
import {
  registrarCredito,
  obtenerCreditos,
  actualizarCredito
} from "../components/credito.controllers.js";

const router = express.Router();
router.use(capturarInfoSolicitud);

router.post(

  "/credito",

  registrarCredito

);

router.put(

  "/credito/:id",

  actualizarCredito

);

router.get(

  "/creditos",

  obtenerCreditos

);

export default router;