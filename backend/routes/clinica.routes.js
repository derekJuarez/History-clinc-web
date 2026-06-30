import { Router } from 'express';
import { getClinicas, registrarClinica, eliminarClinica, getSolicitudes, actualizarEstado, actualizarClinica } from '../controllers/clinica.controller.js';

const router = Router();

// GET /api/clinicas - Obtener todas las clínicas (aprobadas)
router.get('/', getClinicas);

// GET /api/clinicas/solicitudes - Obtener solicitudes pendientes
router.get('/solicitudes', getSolicitudes);

// POST /api/clinicas - Registrar una nueva clínica
router.post('/', registrarClinica);

// PUT /api/clinicas/:id - Actualizar datos de clínica
router.put('/:id', actualizarClinica);

// DELETE /api/clinicas/:id - Eliminar clínica
router.delete('/:id', eliminarClinica);

// PUT /api/clinicas/:id/estado - Actualizar estado (aprobar/rechazar)
router.put('/:id/estado', actualizarEstado);

export default router;
