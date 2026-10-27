import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import db from "./firebase.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import pedidoRoutes from "./routes/pedido.routes.js";
import creditoRoutes from "./routes/credito.routes.js";
import climaRoutes from "./routes/clima.routes.js";
import estadisticasRoutes from "./routes/estadisticas.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

const limiterEscritura = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: "Demasiadas peticiones desde esta IP. Intenta de nuevo más tarde.",
  },
  handler: async (req, res, next, options) => {
    try {
      await db.collection("auditoria").add({
        accion: "rate_limit_bloqueado",
        fecha: new Date().toISOString(),
        ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip,
        userAgent: req.headers["user-agent"],
        ruta: req.originalUrl,
        metodo: req.method,
      });
    } catch (e) {
      /* auditoría opcional */
    }
    res.status(options.statusCode).json(options.message);
  },
});

app.use("/api/productos/producto", limiterEscritura);
app.use("/api/categorias/categoria", limiterEscritura);

app.use("/api/categorias", categoriaRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/creditos", creditoRoutes);
app.use("/api", climaRoutes);
app.use("/api", estadisticasRoutes);

app.use("/pdf", (req, res) => {
  res.status(400).json({
    mensaje: "Ruta no válida. Use /api/estadisticas/pdf para exportar estadísticas en PDF.",
  });
});

app.use("/excel", (req, res) => {
  res.status(400).json({
    mensaje: "Ruta no válida. Use /api/estadisticas/excel para exportar estadísticas en Excel.",
  });
});

app.use("/csv", (req, res) => {
  res.status(400).json({
    mensaje: "Ruta no válida. Use /api/estadisticas/csv para exportar estadísticas en CSV.",
  });
});

app.use("/json", (req, res) => {
  res.status(400).json({
    mensaje: "Ruta no válida. Use /api/productos/json para exportar productos en JSON.",
  });
});
app.use("/api/productos/pdf", (req, res) => {
  res.status(400).json({
    mensaje: "Ruta no válida. Use /api/estadisticas/pdf para exportar estadísticas en PDF.",
  });
});

app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no registrada.",
  });
});

export default app;
