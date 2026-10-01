import "dotenv/config";
import app from "./App.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor de prueva ejecutándose en el puerto ${PORT}`);
});