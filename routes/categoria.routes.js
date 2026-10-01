import express from "express";

import multer from "multer";

import {
  registrarCategoria,
  obtenerCategorias,
  actualizarCategoria
} from "../components/categoria.controllers.js";

const router = express.Router();

const upload = multer({

  storage: multer.memoryStorage(),

  limits: {

    fileSize: 5 * 1024 * 1024,

  },

});

router.post(

  "/categoria",

  upload.single("imagen"),

  registrarCategoria

);

router.put(
  "/categoria/:id",
  upload.single("imagen"),
  actualizarCategoria
);

router.get("/categorias", obtenerCategorias);

export default router;