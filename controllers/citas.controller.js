import { registrarCita,obtenerCitas,modificarCita, verificarChoqueDeHorario, obtenerCitasPorPaciente } from '../models/citas.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

export async function registrar(req, res) {
    try {
        const citaData = req.body;

        if(req.file){
            citaData.radiografia = req.file.filename; // Guardar el nombre del archivo en la propiedad radiografia
        }else{
            citaData.radiografia = null; // Si no se subió ningún archivo, establecer como null
        }
        
        const horarioOcupado = await verificarChoqueDeHorario(citaData.fecha, citaData.hora);

        if (horarioOcupado) {
            return errorResponse(res, 409, 'El horario seleccionado ya está ocupado. Por favor, elige otro.');
        }
        
        const result = await registrarCita(citaData);
        successResponse(res, 201, 'Cita registrada exitosamente', { id: result });
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

export async function obtenerPorPaciente(req, res) {
    try {
        const id_paciente = req.params.id;
        const citas = await obtenerCitasPorPaciente(id_paciente);
        successResponse(res, 200, 'Citas obtenidas exitosamente', citas);
    } catch (error) {
        console.error('Error al obtener citas por paciente:', error);
        errorResponse(res, 500, 'Error al obtener citas por paciente');
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


