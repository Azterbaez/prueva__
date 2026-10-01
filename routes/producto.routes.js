import express from "express";

import multer from "multer";

import {
  registrarProducto,
  obtenerProductos,
  actualizarProducto
} from "../components/producto.controller.js";

const router = express.Router();

const upload = multer({

  storage: multer.memoryStorage(),

  limits: {

    fileSize: 5 * 1024 * 1024,

  },

});

router.post(

  "/producto",

  upload.single("imagen"),

  registrarProducto

);

router.put(

  "/producto/:id",

  upload.single("imagen"),

  actualizarProducto

);

router.get(

  "/productos",

  obtenerProductos

);

export default router;