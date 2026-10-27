import db from "../firebase.js";

export const calcularEstadisticas = async () => {
  const snapshot = await db.collection("productos").orderBy("fecha", "desc").get();

  const productos = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (productos.length === 0) {
    return {
      total: 0,
      promedioPrecio: 0,
      stockTotal: 0,
      precioMin: null,
      precioMax: null,
      porCategoria: {},
      porMes: {},
      productos,
    };
  }

  const total = productos.length;
  const sumaPrecio = productos.reduce((acc, p) => acc + (Number(p.precio) || 0), 0);
  const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const promedioPrecio = Number((sumaPrecio / total).toFixed(2));

  const precios = productos.map((p) => Number(p.precio) || 0);
  const precioMin = Math.min(...precios);
  const precioMax = Math.max(...precios);

  const porCategoria = {};
  productos.forEach((p) => {
    const cat = p.categoriaRef || "Sin categoría";
    porCategoria[cat] = (porCategoria[cat] || 0) + 1;
  });

  const porMes = {};
  productos.forEach((p) => {
    if (!p.fecha) return;
    const fecha = new Date(p.fecha);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    porMes[mes] = (porMes[mes] || 0) + 1;
  });

  return {
    total,
    promedioPrecio,
    stockTotal,
    precioMin,
    precioMax,
    porCategoria,
    porMes,
    productos,
  };
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await calcularEstadisticas();
    const { productos, ...resumen } = stats;

    res.status(200).json({
      mensaje: "Estadísticas generadas correctamente",
      ...resumen,
      detalleCategorias: Object.entries(stats.porCategoria).map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
        porcentaje: Number(((cantidad / stats.total) * 100).toFixed(1)),
      })),
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      mensaje: "Error al generar las estadísticas.",
      error: error.message,
    });
  }
};
