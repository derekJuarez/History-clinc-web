import { obtenerTodosMaestros } from '../models/user.model.js'; 
import {successResponse, errorResponse} from '../utils/helpers.util.js';


export const obtenerTodos = async (req, res) => {
    try {
        const maestrosRaw = await obtenerTodosMaestros();
        
        // Normalizar claves para asegurar compatibilidad de mayúsculas/minúsculas
        const maestros = maestrosRaw.map(m => {
            const nameKey = Object.keys(m).find(k => k.toLowerCase() === 'name') || 'Name';
            const matriculaKey = Object.keys(m).find(k => k.toLowerCase() === 'id_matricula') || 'ID_Matricula';
            return {
                ID_Matricula: m[matriculaKey],
                Name: m[nameKey]
            };
        });

        return successResponse(res, 200, 'Maestros obtenidos exitosamente', maestros);

    } catch (error) {
        console.error('Error al obtener maestros:', error);
        return errorResponse(res, 500, 'Error al obtener maestros');
    }
};

