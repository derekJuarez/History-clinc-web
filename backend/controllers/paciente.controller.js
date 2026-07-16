import { registrarPaciente, obtenerPacientes, PacienteDuplicadoError, PacienteDeOtroEstudianteError } from '../models/paciente_model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

export const registrar = async (req, res) => {
    try {
        const pacienteData = req.body;
        const result = await registrarPaciente(pacienteData);

        const mensaje = result.completado
            ? 'Paciente vinculado a tu lista exitosamente.'
            : 'Paciente registrado exitosamente.';

        successResponse(res, 201, mensaje, result);
    } catch (error) {
        if (error instanceof PacienteDuplicadoError || error instanceof PacienteDeOtroEstudianteError) {
            return errorResponse(res, 409, error.message);
        }
        console.error('Error al registrar paciente:', error);
        errorResponse(res, 500, 'Error al registrar paciente');
    }
};

export const obtenerTodos = async (req, res) => {
    try {
        // Extraer la matrícula del estudiante desde el token de autenticación
        const pacientes = await obtenerPacientes(req.user.matricula);
        return successResponse(res, 200, 'Pacientes obtenidos exitosamente', pacientes);
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        return errorResponse(res, 500, 'Error al obtener pacientes');
    }
};