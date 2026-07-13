import {
    getSolicitudesPendientes,
    getAllSolicitudes,
    findSolicitudById,
    actualizarEstadoSolicitud
} from '../models/solicitud_asesor.model.js';
import { actualizarMaestroDeAlumno } from '../models/alumno.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

// Obtener solicitudes pendientes de cambio de asesor (para el admin)
export const getSolicitudesCambioAsesor = async (req, res) => {
    try {
        const { historial } = req.query;
        const solicitudes = historial === 'true'
            ? await getAllSolicitudes()
            : await getSolicitudesPendientes();
        return successResponse(res, 200, 'Solicitudes obtenidas exitosamente', solicitudes);
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        return errorResponse(res, 500, 'Error interno del servidor al obtener solicitudes');
    }
};

// Aceptar o rechazar una solicitud de cambio de asesor
export const actualizarSolicitudCambioAsesor = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !['APROBADO', 'RECHAZADO'].includes(estado)) {
        return errorResponse(res, 400, 'Estado inválido. Debe ser APROBADO o RECHAZADO');
    }

    try {
        const solicitud = await findSolicitudById(id);
        if (!solicitud) {
            return errorResponse(res, 404, 'Solicitud no encontrada');
        }

        // Leer columnas del nuevo esquema (PascalCase)
        const estadoActual = solicitud.Estado || solicitud.ESTADO;
        if (estadoActual !== 'PENDIENTE') {
            return errorResponse(res, 409, `Esta solicitud ya fue ${estadoActual.toLowerCase()}`);
        }

        // Actualizar estado de la solicitud
        await actualizarEstadoSolicitud(id, estado);

        // Si se aprueba, cambiar el maestro del alumno en la tabla usuarios
        if (estado === 'APROBADO') {
            await actualizarMaestroDeAlumno(
                solicitud.MatriculaAlumno || solicitud.MATRICULA_ALUMNO,
                solicitud.MatriculaMaestroNuevo || solicitud.MATRICULA_MAESTRO_NUEVO
            );
        }

        const nombreAlumno = solicitud.NombreAlumno || solicitud.NOMBRE_ALUMNO;
        const nombreMaestroNuevo = solicitud.NombreMaestroNuevo || solicitud.NOMBRE_MAESTRO_NUEVO;
        const nombreMaestroActual = solicitud.NombreMaestroActual || solicitud.NOMBRE_MAESTRO_ACTUAL;

        const mensaje = estado === 'APROBADO'
            ? `Solicitud aprobada. El alumno ${nombreAlumno} ahora está asignado a ${nombreMaestroNuevo}`
            : `Solicitud rechazada. El alumno ${nombreAlumno} permanece con ${nombreMaestroActual}`;

        return successResponse(res, 200, mensaje, { id, estado });
    } catch (error) {
        console.error('Error al actualizar solicitud:', error);
        return errorResponse(res, 500, 'Error interno del servidor al actualizar la solicitud');
    }
};
