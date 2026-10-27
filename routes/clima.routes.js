import express from "express";
import { obtenerClima } from "../components/clima.controllers.js";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js";

const router = express.Router();
router.use(capturarInfoSolicitud);
router.get("/clima", obtenerClima);

export default router;
