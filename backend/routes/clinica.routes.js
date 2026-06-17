import { Router } from 'express';
import { getClinicas, registrarClinica, eliminarClinica } from '../controllers/clinica.controller.js';

const router = Router();

// GET /api/clinicas - Obtener todas las clínicas
router.get('/', getClinicas);

// POST /api/clinicas - Registrar una nueva clínica
router.post('/', registrarClinica);

// DELETE /api/clinicas/:id - Eliminar clínica
router.delete('/:id', eliminarClinica);

export default router;
