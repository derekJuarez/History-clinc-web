import { Router } from 'express';
import { getAlumnos, registrarAlumno, eliminarAlumno, getAlumnosPorMaestro, actualizarAlumno } from '../controllers/alumno.controller.js';

const router = Router();

// GET /api/alumnos - Obtener todos los alumnos
router.get('/', getAlumnos);

// GET /api/alumnos/maestro/:matricula - Obtener alumnos de un maestro
router.get('/maestro/:matricula', getAlumnosPorMaestro);

// POST /api/alumnos - Registrar un nuevo alumno
router.post('/', registrarAlumno);

// PUT /api/alumnos/:matricula - Actualizar alumno
router.put('/:matricula', actualizarAlumno);

// DELETE /api/alumnos/:id - Eliminar alumno
router.delete('/:id', eliminarAlumno);

export default router;
