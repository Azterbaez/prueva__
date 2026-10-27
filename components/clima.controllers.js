export const obtenerClima = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({
        mensaje: "Faltan parámetros de latitud o longitud",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        mensaje: "Los parámetros de latitud y longitud deben ser números válidos",
      });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability&forecast_hours=12&timezone=auto`;

    const respuesta = await fetch(url);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      return res.status(500).json({
        mensaje: "Error al obtener los datos del clima",
        error: data.reason || "Error desconocido",
      });
    }

    const pronostico = data.hourly.time.map((hora, index) => ({
      hora,
      temperatura: data.hourly.temperature_2m[index],
      probabilidad_precipitacion: data.hourly.precipitation_probability[index],
    }));

    res.status(200).json({
      ubicacion: {
        latitud: latitude,
        longitud: longitude,
      },
      pronostico,
    });
  } catch (error) {
    console.error("Error al obtener el clima:", error);
    res.status(500).json({
      mensaje: "Error al obtener el clima",
      error: error.message || "Error desconocido",
    });
  }
};
