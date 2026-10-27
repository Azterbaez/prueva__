import express from "express";
import multer from "multer";
import { capturarInfoSolicitud } from "../middlewares/auditoria.js";
import {
  registrarProducto,
  obtenerProductos,
  actualizarProducto,
  buscarProductos,
  eliminarProducto,
  enviarProductosPorEmail,
} from "../components/producto.controller.js";

const router = express.Router();
router.use(capturarInfoSolicitud);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/producto", upload.single("imagen"), registrarProducto);
router.put("/producto/:id", upload.single("imagen"), actualizarProducto);
router.delete("/producto/:id", eliminarProducto);
router.get("/productos", obtenerProductos);
router.get("/productos/buscar", buscarProductos);
router.get("/productos/enviar-email", enviarProductosPorEmail);

export default router;
