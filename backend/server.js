import app from './app.js';
import './config/db.js'; // Inicializar la conexión a DB

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
