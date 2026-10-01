
import express from "express";

import cors from "cors";

import categoriaRoutes from "./routes/categoria.routes.js";

import clienteRoutes from "./routes/cliente.routes.js";

import productoRoutes from "./routes/producto.routes.js";

import pedidoRoutes from "./routes/pedido.routes.js";

import creditoRoutes from "./routes/credito.routes.js";


const app = express();


// Middlewares

app.use(cors());

app.use(express.json());


// Rutas

app.use("/api/categorias", categoriaRoutes);

app.use("/api/clientes", clienteRoutes);

app.use("/api/productos", productoRoutes);

app.use("/api/pedidos", pedidoRoutes);

app.use("/api/creditos", creditoRoutes);


// 404

app.use((req, res) => {

  res.status(404).json({

    mensaje: "Ruta no registrada."

  });

});


export default app;

