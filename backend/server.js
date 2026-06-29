import app from './app.js';
import './config/db.js'; // Inicializar la conexión a DB

const PORT = process.env.PORT || 3001;

// Escuchar en 0.0.0.0 para que ngrok y redes externas puedan acceder
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🌐 Accesible en red local en http://0.0.0.0:${PORT}`);
    console.log(`🚇 Para exponer con ngrok: ngrok http ${PORT}`);
});
