import { Router } from 'express';
import { getDocentes, registrarDocente, eliminarDocente, actualizarDocente } from '../controllers/docente.controller.js';

const router = Router();

// GET /api/docentes - Obtener todos los docentes asesores
router.get('/', getDocentes);

// POST /api/docentes - Registrar un nuevo docente asesor
router.post('/', registrarDocente);

// PUT /api/docentes/:matricula - Actualizar datos de docente
router.put('/:matricula', actualizarDocente);

// DELETE /api/docentes/:matricula - Eliminar un docente asesor
router.delete('/:matricula', eliminarDocente);

export default router;
