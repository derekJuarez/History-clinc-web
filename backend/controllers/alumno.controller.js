import {
    findAlumnoEnUsuariosByMatricula,
    crearAlumnoEnUsuarios,
    actualizarMaestroDeAlumno,
    getAllAlumnos,
    deleteAlumno,
    obtenerAlumnosDeMaestro,
    updateAlumno,
    getMaestroDeAlumno
} from '../models/alumno.model.js';
import { findUserByMatricula } from '../models/user.model.js';
import { crearSolicitudCambioAsesor } from '../models/solicitud_asesor.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

// Obtener todos los alumnos (legacy)
export const getAlumnos = async (req, res) => {
    try {
        const alumnos = await getAllAlumnos();
        return successResponse(res, 200, 'Alumnos obtenidos exitosamente', alumnos);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};

/**
 * Registrar un alumno desde la pantalla del maestro.
 * 
 * CASO 1: El alumno NO existe en usuarios → se crea con Id_Rol=2 y el maestro actual asignado.
 * CASO 2: El alumno existe en usuarios SIN maestro → se le asigna el maestro actual.
 * CASO 3: El alumno existe en usuarios CON OTRO maestro → se genera solicitud de cambio de asesor.
 * 
 * Body: { nombre, matricula, contrasena, maestro_matricula }
 */
export const registrarAlumno = async (req, res) => {
    const { nombre, matricula, contrasena, maestro_matricula } = req.body;

    if (!nombre || !matricula || !maestro_matricula) {
        return errorResponse(res, 400, 'Nombre, matrícula del alumno y matrícula del maestro son requeridos');
    }

    try {
        // Verificar que el maestro que hace el registro existe
        const maestro = await findUserByMatricula(maestro_matricula);
        if (!maestro || maestro.Id_Rol !== 1) {
            return errorResponse(res, 403, 'No se encontró al maestro o no tiene permisos para registrar alumnos');
        }

        // Buscar al alumno en la tabla usuarios
        const alumnoExistente = await findAlumnoEnUsuariosByMatricula(matricula);

        // ─── CASO 1: Alumno no existe → crear con maestro asignado ───────────
        if (!alumnoExistente) {
            const passwordDefault = contrasena || matricula; // Si no manda contraseña, usa la matrícula
            await crearAlumnoEnUsuarios({
                nombre,
                matricula,
                contraseña: passwordDefault,
                id_maestro: maestro_matricula
            });
            return successResponse(res, 201, 'Alumno registrado y asignado exitosamente', {
                matricula,
                nombre,
                maestro: maestro.Nombre
            });
        }

        // ─── CASO 2: Alumno existe SIN maestro → asignar maestro actual ──────
        if (!alumnoExistente.Id_Maestro) {
            await actualizarMaestroDeAlumno(matricula, maestro_matricula);
            return successResponse(res, 200, 'Maestro asignado al alumno existente exitosamente', {
                matricula,
                nombre: alumnoExistente.Nombre,
                maestro: maestro.Nombre
            });
        }

        // ─── CASO 3: Alumno existe CON OTRO maestro → solicitud de cambio ────
        if (alumnoExistente.Id_Maestro !== maestro_matricula) {
            // Obtener datos del maestro actual para la solicitud
            const maestroActual = await findUserByMatricula(alumnoExistente.Id_Maestro);

            await crearSolicitudCambioAsesor({
                matricula_alumno: matricula,
                nombre_alumno: alumnoExistente.Nombre,
                matricula_maestro_nuevo: maestro_matricula,
                nombre_maestro_nuevo: maestro.Nombre,
                matricula_maestro_actual: alumnoExistente.Id_Maestro,
                nombre_maestro_actual: maestroActual ? maestroActual.Nombre : 'Desconocido'
            });

            return successResponse(res, 202, 'El alumno ya tiene un maestro asignado. Se generó una solicitud de cambio de asesor al administrador.', {
                matricula,
                nombre_alumno: alumnoExistente.Nombre,
                maestro_actual: maestroActual ? maestroActual.Nombre : 'Desconocido',
                maestro_solicitante: maestro.Nombre
            });
        }

        // Si el alumno ya tiene el MISMO maestro
        return successResponse(res, 200, 'Este alumno ya está asignado a tu lista', {
            matricula,
            nombre: alumnoExistente.Nombre
        });

    } catch (error) {
        console.error('Error al registrar alumno:', error);
        return errorResponse(res, 500, 'Error interno del servidor al registrar alumno');
    }
};

// Eliminar un alumno (legacy)
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

// Obtener los alumnos de un maestro
export const getAlumnosPorMaestro = async (req, res) => {
    const { matricula } = req.params;

    if (!matricula) {
        return errorResponse(res, 400, 'La matrícula del maestro es requerida');
    }

    try {
        console.log(`[DEBUG] Buscando alumnos del maestro con matrícula: "${matricula}" (tipo: ${typeof matricula})`);
        const alumnos = await obtenerAlumnosDeMaestro(matricula);
        console.log(`[DEBUG] Alumnos encontrados: ${alumnos.length}`, alumnos.map(a => a.matricula));
        return successResponse(res, 200, 'Alumnos del maestro obtenidos exitosamente', alumnos);
    } catch (error) {
        console.error('Error al obtener alumnos del maestro:', error);
        return errorResponse(res, 500, 'Error interno del servidor al obtener alumnos');
    }
};

// Actualizar los datos de un alumno
export const actualizarAlumno = async (req, res) => {
    const { matricula } = req.params;
    const { nombre, correo, telefono } = req.body;

    if (!nombre || !correo || !telefono) {
        return errorResponse(res, 400, 'Nombre, correo y teléfono son obligatorios');
    }

    try {
        await updateAlumno(matricula, { nombre, correo, telefono });
        return successResponse(res, 200, 'Alumno actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar alumno:', error);
        return errorResponse(res, 500, 'Error interno del servidor al actualizar alumno');
    }
};

// Obtener la información del maestro del alumno logueado
export const getMiMaestroInfo = async (req, res) => {
    try {
        const matriculaAlumno = req.user.matricula;
        const maestro = await getMaestroDeAlumno(matriculaAlumno);
        
        if (!maestro) {
            return errorResponse(res, 404, 'No se encontró maestro asignado para este alumno');
        }

        return successResponse(res, 200, 'Información del maestro obtenida exitosamente', maestro);
    } catch (error) {
        console.error('Error al obtener la info del maestro:', error);
        return errorResponse(res, 500, 'Error interno del servidor');
    }
};
