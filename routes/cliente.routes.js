import express from "express";

import {
  registrarCliente,
  obtenerClientes,
  actualizarCliente
} from "../components/cliente.controllers.js";

const router = express.Router();

router.post(

  "/cliente",

  registrarCliente

);

router.put(

  "/cliente/:id",

  actualizarCliente

);

router.get(

  "/clientes",

  obtenerClientes

);

export default router;