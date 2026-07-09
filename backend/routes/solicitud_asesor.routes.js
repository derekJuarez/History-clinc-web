import { Router } from 'express';
import {
    getSolicitudesCambioAsesor,
    actualizarSolicitudCambioAsesor
} from '../controllers/solicitud_asesor.controller.js';

const router = Router();

// GET /api/solicitudes-asesor          → Solicitudes pendientes
// GET /api/solicitudes-asesor?historial=true → Historial completo
router.get('/', getSolicitudesCambioAsesor);

// PUT /api/solicitudes-asesor/:id → Aceptar o rechazar solicitud
router.put('/:id', actualizarSolicitudCambioAsesor);

export default router;
