import { Router } from 'express';
import { getAlumnos, registrarAlumno, eliminarAlumno } from '../controllers/alumno.controller.js';

const router = Router();

// GET /api/alumnos - Obtener todos los alumnos
router.get('/', getAlumnos);

// POST /api/alumnos - Registrar un nuevo alumno
router.post('/', registrarAlumno);

// DELETE /api/alumnos/:id - Eliminar alumno
router.delete('/:id', eliminarAlumno);

export default router;
