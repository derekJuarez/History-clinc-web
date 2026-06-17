import { getAllAlumnos, findAlumnoByMatricula, createAlumno, deleteAlumno } from '../models/alumno.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

// Obtener todos los alumnos
export const getAlumnos = async (req, res) => {
    try {
        const alumnos = await getAllAlumnos();
        return successResponse(res, 200, 'Alumnos obtenidos exitosamente', alumnos);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};

// Registrar un nuevo alumno
export const registrarAlumno = async (req, res) => {
    const { nombre, matricula, unidad_clinica } = req.body;

    if (!nombre || !matricula || !unidad_clinica) {
        return errorResponse(res, 400, 'Todos los campos son requeridos');
    }

    try {
        // Verificar si la matrícula ya está registrada
        const existingAlumno = await findAlumnoByMatricula(matricula);
        if (existingAlumno) {
            return errorResponse(res, 409, 'La matrícula ya está registrada');
        }

        const newId = await createAlumno({ nombre, matricula, unidad_clinica });
        return successResponse(res, 201, 'Alumno registrado exitosamente', {
            id: newId,
            nombre,
            matricula,
            unidad_clinica
        });
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor al registrar alumno');
    }
};

// Eliminar un alumno
export const eliminarAlumno = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteAlumno(id);
        return successResponse(res, 200, 'Alumno eliminado exitosamente');
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};
