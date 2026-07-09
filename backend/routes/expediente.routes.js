import { Router } from 'express';
import {
    guardarExpediente,
    getExpedientesPorMaestro,
    getExpedienteById,
    getExpedientesPorAlumno,
    marcarRevisado,
    buscarPaciente
} from '../controllers/expediente.controller.js';

const router = Router();

// POST /api/expedientes/guardar — Alumno sube informe clínico
router.post('/guardar', guardarExpediente);

// GET /api/expedientes/maestro/:matricula — Maestro ve informes de sus alumnos
router.get('/maestro/:matricula', getExpedientesPorMaestro);

// GET /api/expedientes/alumno/:matricula — Alumno ve sus propios informes
router.get('/alumno/:matricula', getExpedientesPorAlumno);

// GET /api/expedientes/buscar/:valor — Buscar paciente por nombre o teléfono
router.get('/buscar/:valor', buscarPaciente);

// GET /api/expedientes/:id — Ver detalle de un informe
router.get('/:id', getExpedienteById);

// PUT /api/expedientes/:id/revisado — Marcar como revisado
router.put('/:id/revisado', marcarRevisado);

export default router;
