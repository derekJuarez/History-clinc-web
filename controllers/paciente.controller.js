import {registrarPaciente, obtenerPacientes} from '../models/paciente_model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

export const registrar = async (req, res) => {
    try {
        const pacienteData = req.body;
        const result = await registrarPaciente(pacienteData);
        successResponse(res, 201, 'Paciente registrado exitosamente',result,);
    } catch (error) {
        errorResponse(res, 500, 'Error al registrar paciente');
    }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pacientes = await obtenerPacientes();
        return successResponse(res, 200, 'Pacientes obtenidos exitosamente', pacientes);
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        return errorResponse(res, 500, 'Error al obtener pacientes');
    }
};