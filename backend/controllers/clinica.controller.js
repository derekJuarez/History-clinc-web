import { getAllClinicas, getSolicitudesClinicas, findClinicaByNombre, createClinica, deleteClinica, updateEstadoClinica, updateClinica } from '../models/clinica.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

// Obtener todas las clínicas
export const getClinicas = async (req, res) => {
    try {
        const clinicas = await getAllClinicas();
        return successResponse(res, 200, 'Clínicas obtenidas exitosamente', clinicas);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};

// Registrar una nueva clínica
export const registrarClinica = async (req, res) => {
    const { nombre, encargado, ubicacion } = req.body;

    if (!nombre || !encargado || !ubicacion) {
        return errorResponse(res, 400, 'Todos los campos son requeridos');
    }

    try {
        // Verificar si la clínica ya existe
        const existingClinica = await findClinicaByNombre(nombre);
        if (existingClinica) {
            return errorResponse(res, 409, 'Ya existe una clínica con ese nombre');
        }

        const newId = await createClinica({ nombre, encargado, ubicacion });
        return successResponse(res, 201, 'Clínica registrada exitosamente', {
            id: newId,
            nombre,
            encargado,
            ubicacion
        });
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor al registrar clínica');
    }
};

// Eliminar una clínica
export const eliminarClinica = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteClinica(id);
        return successResponse(res, 200, 'Clínica eliminada exitosamente');
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};

// Obtener solicitudes pendientes
export const getSolicitudes = async (req, res) => {
    try {
        const solicitudes = await getSolicitudesClinicas();
        return successResponse(res, 200, 'Solicitudes obtenidas', solicitudes);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};

// Actualizar estado de clínica (Aceptar/Rechazar)
export const actualizarEstado = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !['APROBADO', 'RECHAZADO'].includes(estado.toUpperCase())) {
        return errorResponse(res, 400, 'Estado inválido');
    }

    try {
        if (estado.toUpperCase() === 'RECHAZADO') {
            // Si se rechaza, eliminar de la BD para que el maestro pueda volver a registrarla
            await deleteClinica(id);
            return successResponse(res, 200, 'Clínica rechazada y eliminada exitosamente');
        } else {
            await updateEstadoClinica(id, estado.toUpperCase());
            return successResponse(res, 200, 'Clínica aprobada exitosamente');
        }
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};

// Actualizar clínica
export const actualizarClinica = async (req, res) => {
    const { id } = req.params;
    const { nombre, encargado, ubicacion } = req.body;

    if (!nombre || !encargado || !ubicacion) {
        return errorResponse(res, 400, 'Todos los campos son obligatorios');
    }

    try {
        await updateClinica(id, { nombre, encargado, ubicacion });
        return successResponse(res, 200, 'Clínica actualizada exitosamente');
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor al actualizar clínica');
    }
};

