import {registrarPaciente} from '../models/paciente_model.js';
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