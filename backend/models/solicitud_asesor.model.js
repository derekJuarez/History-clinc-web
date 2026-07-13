import db from '../config/db.js';

// Crear una nueva solicitud de cambio de asesor
export const crearSolicitudCambioAsesor = async ({
    matricula_alumno,
    nombre_alumno,
    matricula_maestro_nuevo,
    nombre_maestro_nuevo,
    matricula_maestro_actual,
    nombre_maestro_actual
}) => {
    const [result] = await db.query(
        `INSERT INTO solicitud_cambio_asesor 
         (MatriculaAlumno, NombreAlumno, MatriculaMaestroNuevo, NombreMaestroNuevo, MatriculaMaestroActual, NombreMaestroActual)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [matricula_alumno, nombre_alumno, matricula_maestro_nuevo, nombre_maestro_nuevo, matricula_maestro_actual, nombre_maestro_actual]
    );
    return result.insertId;
};

// Obtener todas las solicitudes pendientes (para el admin)
export const getSolicitudesPendientes = async () => {
    const [rows] = await db.query(
        `SELECT * FROM solicitud_cambio_asesor WHERE Estado = 'PENDIENTE' ORDER BY FechaSolicitud DESC`
    );
    return rows;
};

// Obtener todas las solicitudes (historial)
export const getAllSolicitudes = async () => {
    const [rows] = await db.query(
        `SELECT * FROM solicitud_cambio_asesor ORDER BY FechaSolicitud DESC`
    );
    return rows;
};

// Buscar solicitud por ID
export const findSolicitudById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM solicitud_cambio_asesor WHERE Id_Solicitud = ?',
        [id]
    );
    return rows[0];
};

// Actualizar estado de solicitud (APROBADO o RECHAZADO)
export const actualizarEstadoSolicitud = async (id, estado) => {
    await db.query(
        'UPDATE solicitud_cambio_asesor SET Estado = ? WHERE Id_Solicitud = ?',
        [estado, id]
    );
};

