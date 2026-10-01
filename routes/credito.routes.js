import express from "express";

import {
  registrarCredito,
  obtenerCreditos,
  actualizarCredito
} from "../components/credito.controllers.js";

const router = express.Router();

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