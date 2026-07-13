import { Router } from 'express';
import { login, register, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { validateSchema, verifyToken } from '../middlewares/auth.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const router = Router();

// Definimos la ruta POST para /login
router.post('/login', validateSchema(loginSchema), login);

// Ruta POST para /register
router.post('/register', validateSchema(registerSchema), register);

// Rutas de perfil (protegidas por token)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

export default router;

