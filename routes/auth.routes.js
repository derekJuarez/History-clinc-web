import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validateSchema } from '../middlewares/auth.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const router = Router();

// Definimos la ruta POST para /login
// Flujo: 1. Valida los datos (Zod) -> 2. Ejecuta lógica (Controller)
router.post('/login', validateSchema(loginSchema), login);

// Ruta POST para /register
router.post('/register', validateSchema(registerSchema), register);

export default router;

