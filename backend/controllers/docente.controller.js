import { 
    getAllDocentes, 
    findDocenteByMatricula, 
    createDocente, 
    deleteDocenteByMatricula 
} from '../models/docente.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

// Obtener todos los docentes
export const getDocentes = async (req, res) => {
    try {
        const docentes = await getAllDocentes();
        return successResponse(res, 200, 'Docentes obtenidos exitosamente', docentes);
    } catch (error) {
        console.error('Error al obtener docentes:', error);
        return errorResponse(res, 500, 'Error interno del servidor al obtener docentes');
    }
};

// Registrar un nuevo docente
export const registrarDocente = async (req, res) => {
    const { nombre, apellido, matricula, email, telefono, contraseña } = req.body;

    if (!nombre || !apellido || !matricula || !email || !telefono || !contraseña) {
        return errorResponse(res, 400, 'Todos los campos son obligatorios');
    }

    try {
        // Verificar si ya existe un docente (o usuario) con esa matrícula
        const existingDocente = await findDocenteByMatricula(matricula);
        if (existingDocente) {
            return errorResponse(res, 409, 'La matrícula ya está registrada para otro docente');
        }

        await createDocente({ nombre, apellido, matricula, email, telefono, contraseña });
        return successResponse(res, 201, 'Docente registrado exitosamente', {
            matricula,
            nombre: `${nombre} ${apellido}`.trim()
        });
    } catch (error) {
        console.error('Error al registrar docente:', error);
        return errorResponse(res, 500, 'Error interno del servidor al registrar docente');
    }
};

// Eliminar un docente
export const eliminarDocente = async (req, res) => {
    const { matricula } = req.params;

    if (!matricula) {
        return errorResponse(res, 400, 'La matrícula del docente es requerida');
    }

    try {
        const existingDocente = await findDocenteByMatricula(matricula);
        if (!existingDocente) {
            return errorResponse(res, 404, 'Docente no encontrado');
        }

        await deleteDocenteByMatricula(matricula);
        return successResponse(res, 200, 'Docente eliminado exitosamente');
    } catch (error) {
        console.error('Error al eliminar docente:', error);
        return errorResponse(res, 500, 'Error interno del servidor al eliminar docente');
    }
};
