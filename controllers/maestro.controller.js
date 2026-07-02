import { obtenerTodosMaestros } from '../models/user.model.js'; 
import {successResponse, errorResponse} from '../utils/helpers.util.js';


export const obtenerTodos = async (req, res) => {
    try {
        const maestroDarta = req.body;
        const maestros = await obtenerTodosMaestros();
        successResponse(res, 201, 'Maestros obtenidos exitosamente', maestros);

    }catch (error) {
        console.error('Error al obtener maestros:', error);
        errorResponse(res, 500, 'Error al obtener maestros');
    }
};

