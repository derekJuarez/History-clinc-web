import { registrarCita,obtenerCitas,modificarCita } from '../models/citas.model.js';
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

export async function obtener(req, res) {
    try {
        const citas = await obtenerCitas();
        successResponse(res, 200, 'Citas obtenidas exitosamente', citas);
    }catch (error) {
        console.error('Error al obtener citas:', error);
        errorResponse(res, 500, 'Error al obtener citas');
    }
}

export async function modificar(req, res) {
    try {
        
        const  id_cita = req.params.id;
        const nuevosDatos = req.body;

        const actualizado = await modificarCita(id_cita, nuevosDatos);

        if (actualizado) {
            successResponse(res, 200, 'Cita modificada exitosamente');
        } else {
            errorResponse(res, 404, 'Cita no encontrada');
        }
    } catch (error) {
        console.error('Error al modificar cita:', error);
        errorResponse(res, 500, 'Error al modificar cita');
    }
}


