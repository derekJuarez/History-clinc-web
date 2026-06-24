import { registrarCita } from '../models/citas.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

export async function registrar(req, res) {
    try {
        const citaData = req.body;
        const result = await registrarCita(citaData);
        successResponse(res, 201, 'Cita registrada exitosamente', result);
    } catch (error) {
        console.error('Error al registrar cita:', error);
        errorResponse(res, 500, 'Error al registrar cita');
    }
}

