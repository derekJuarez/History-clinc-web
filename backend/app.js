import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';
// Importar rutas
import authRoutes from './routes/auth.routes.js';
import pacienteRoutes from './routes/paciente.routes.js';


//archivos frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Inicializar express
const app = express();

// Middlewares Globales
app.use(cors()); // Permite peticiones de otros orígenes (Frontend)
app.use(helmet({
    contentSecurityPolicy: false // Desactiva CSP para que no bloquee extensiones o DevTools de Chrome
})); // Seguridad en cabeceras HTTP
app.use(morgan('dev')); // Logger de peticiones HTTP en consola
app.use(express.json()); // Permite recibir JSON en el body
app.use(express.urlencoded({ extended: true })); // Permite recibir datos de formularios
app.use(express.static(join(__dirname, '../Frontend'))); // Servir archivos estáticos del frontend

//ruta base
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../Frontend/login.html'));
});

app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/paciente', pacienteRoutes); // Rutas de paciente

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para manejar errores
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});


export default app;
