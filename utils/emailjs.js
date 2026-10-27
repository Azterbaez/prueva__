import emailjs from "@emailjs/nodejs";

export const enviarListadoProductos = async (productos) => {
  const message = productos
    .map(
      (p, i) =>
        `${i + 1}. ${p.nombre} | Precio: $${p.precio} | Stock: ${p.stock} | Categoría: ${p.categoriaRef} | ID: ${p.id}`
    )
    .join("\n");

  const templateParams = {
    total: productos.length,
    message: message || "No hay productos registrados.",
    fecha: new Date().toLocaleString("es-ES"),
  };

  const response = await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_TEMPLATE_ID,
    templateParams,
    {
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    }
  );

  console.log("Email enviado con éxito:", response.status, response.text);
  return response;
};
