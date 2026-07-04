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
        `INSERT INTO solicitudes_cambio_asesor 
         (MATRICULA_ALUMNO, NOMBRE_ALUMNO, MATRICULA_MAESTRO_NUEVO, NOMBRE_MAESTRO_NUEVO, MATRICULA_MAESTRO_ACTUAL, NOMBRE_MAESTRO_ACTUAL)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [matricula_alumno, nombre_alumno, matricula_maestro_nuevo, nombre_maestro_nuevo, matricula_maestro_actual, nombre_maestro_actual]
    );
    return result.insertId;
};

// Obtener todas las solicitudes pendientes (para el admin)
export const getSolicitudesPendientes = async () => {
    const [rows] = await db.query(
        `SELECT * FROM solicitudes_cambio_asesor WHERE ESTADO = 'PENDIENTE' ORDER BY FECHA_SOLICITUD DESC`
    );
    return rows;
};

// Obtener todas las solicitudes (historial)
export const getAllSolicitudes = async () => {
    const [rows] = await db.query(
        `SELECT * FROM solicitudes_cambio_asesor ORDER BY FECHA_SOLICITUD DESC`
    );
    return rows;
};

// Buscar solicitud por ID
export const findSolicitudById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM solicitudes_cambio_asesor WHERE ID_SOLICITUD = ?',
        [id]
    );
    return rows[0];
};

// Actualizar estado de solicitud (APROBADO o RECHAZADO)
export const actualizarEstadoSolicitud = async (id, estado) => {
    await db.query(
        'UPDATE solicitudes_cambio_asesor SET ESTADO = ? WHERE ID_SOLICITUD = ?',
        [estado, id]
    );
};
