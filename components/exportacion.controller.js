import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import db from "../firebase.js";
import { calcularEstadisticas } from "./estadisticas.controller.js";

export const exportarEstadisticasExcel = async (req, res) => {
  try {
    const stats = await calcularEstadisticas();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistema de Inventario";
    workbook.created = new Date();

    const hojaResumen = workbook.addWorksheet("Resumen");
    hojaResumen.addRow(["Métrica", "Valor"]);
    [
      ["Total de productos", stats.total],
      ["Promedio de precio", stats.promedioPrecio],
      ["Stock total", stats.stockTotal],
      ["Precio mínimo", stats.precioMin ?? "—"],
      ["Precio máximo", stats.precioMax ?? "—"],
      ["Fecha de generación", new Date().toLocaleString("es-ES")],
    ].forEach((row) => hojaResumen.addRow(row));

    const hojaProductos = workbook.addWorksheet("Productos");
    hojaProductos.addRow(["ID", "Nombre", "Precio", "Stock", "Categoría", "Estado", "Fecha"]);
    stats.productos.forEach((p) => {
      hojaProductos.addRow([
        p.id,
        p.nombre,
        p.precio,
        p.stock,
        p.categoriaRef,
        p.estado ? "Activo" : "Inactivo",
        p.fecha ? new Date(p.fecha).toLocaleString("es-ES") : "—",
      ]);
    });

    const nombreArchivo = `estadisticas-productos-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al generar Excel:", error);
    res.status(500).json({
      mensaje: "Error al generar el archivo Excel.",
      error: error.message,
    });
  }
};

export const exportarEstadisticasPDF = async (req, res) => {
  try {
    const stats = await calcularEstadisticas();
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const nombreArchivo = `estadisticas-productos-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
    doc.pipe(res);

    doc.fontSize(20).text("Estadísticas de Productos", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text(`Total: ${stats.total}`);
    doc.text(`Promedio de precio: $${stats.promedioPrecio}`);
    doc.text(`Stock total: ${stats.stockTotal}`);
    doc.text(`Precio mínimo: ${stats.precioMin ?? "—"}`);
    doc.text(`Precio máximo: ${stats.precioMax ?? "—"}`);
    doc.moveDown();
    doc.text(`Generado: ${new Date().toLocaleString("es-ES")}`);
    doc.end();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({
        mensaje: "Error al generar el archivo PDF.",
        error: error.message,
      });
    }
  }
};

export const exportarProductosCSV = async (req, res) => {
  try {
    const snapshot = await db.collection("productos").orderBy("fecha", "desc").get();
    const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const escapar = (valor) => {
      if (valor === null || valor === undefined) return "";
      const str = String(valor);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lineas = [
      ["ID", "Nombre", "Precio", "Stock", "Categoría", "Estado", "URL Imagen", "Fecha"].join(","),
    ];

    productos.forEach((p) => {
      lineas.push(
        [
          escapar(p.id),
          escapar(p.nombre),
          p.precio ?? "",
          p.stock ?? "",
          escapar(p.categoriaRef),
          p.estado ? "Activo" : "Inactivo",
          escapar(p.imagenUrl),
          escapar(p.fecha ? new Date(p.fecha).toLocaleString("es-ES") : ""),
        ].join(",")
      );
    });

    const nombreArchivo = `productos-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
    res.write("\uFEFF");
    res.end(lineas.join("\n"));
  } catch (error) {
    console.error("Error al exportar CSV:", error);
    res.status(500).json({
      mensaje: "Error al generar el archivo CSV.",
      error: error.message,
    });
  }
};

export const exportarProductosJSON = async (req, res) => {
  try {
    const snapshot = await db.collection("productos").orderBy("fecha", "desc").get();
    const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="productos.json"');
    res.send(JSON.stringify(productos, null, 2));
  } catch (error) {
    console.error("Error al exportar JSON:", error);
    res.status(500).json({
      mensaje: "Error al generar el JSON de productos.",
      error: error.message,
    });
  }
};
