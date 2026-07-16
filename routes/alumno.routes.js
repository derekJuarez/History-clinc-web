import { Router } from 'express';
import { getAlumnos, registrarAlumno, eliminarAlumno, getAlumnosPorMaestro, actualizarAlumno, getMiMaestroInfo } from '../controllers/alumno.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/alumnos/mi-maestro-info - Obtener info del maestro del alumno (protegida)
router.get('/mi-maestro-info', verifyToken, getMiMaestroInfo);

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
