import db from "../firebase.js";

export const guardarAuditoria = async ({
  accion,
  entidad,
  entidadId,
  valoresAnteriores = null,
  valoresNuevos = null,
  req,
}) => {
  try {
    await db.collection("auditoria").add({
      accion,
      entidad,
      entidadId: entidadId || null,
      fecha: new Date().toISOString(),
      ip: req.auditoria?.ip || "desconocida",
      userAgent: req.auditoria?.userAgent || "desconocido",
      metodo: req.auditoria?.metodo || req.method,
      ruta: req.auditoria?.ruta || req.originalUrl,
      valoresAnteriores,
      valoresNuevos,
    });
  } catch (err) {
    console.error("Error al guardar auditoría:", err.message);
  }
};
