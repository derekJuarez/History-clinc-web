import { Router } from 'express';
import { getDocentes, registrarDocente, eliminarDocente } from '../controllers/docente.controller.js';

const router = Router();

// GET /api/docentes - Obtener todos los docentes asesores
router.get('/', getDocentes);

// POST /api/docentes - Registrar un nuevo docente asesor
router.post('/', registrarDocente);

// DELETE /api/docentes/:matricula - Eliminar un docente asesor
router.delete('/:matricula', eliminarDocente);

export default router;
