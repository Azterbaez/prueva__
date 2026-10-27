import express from "express";
import { obtenerEstadisticas } from "../components/estadisticas.controller.js";
import {
  exportarEstadisticasExcel,
  exportarEstadisticasPDF,
  exportarProductosCSV,
  exportarProductosJSON,
} from "../components/exportacion.controller.js";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js";

const router = express.Router();
router.use(capturarInfoSolicitud);

router.get("/estadisticas", obtenerEstadisticas);
router.get("/estadisticas/excel", exportarEstadisticasExcel);
router.get("/estadisticas/pdf", exportarEstadisticasPDF);
router.get("/estadisticas/csv", exportarProductosCSV);
router.get("/productos/json", exportarProductosJSON);

export default router;
