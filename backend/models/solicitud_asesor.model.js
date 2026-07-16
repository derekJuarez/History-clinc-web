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
    // Buscar los Ids numéricos
    const [aRows] = await db.query('SELECT Id_Usuario FROM alumnos WHERE Matricula = ?', [matricula_alumno]);
    const id_alumno = aRows.length > 0 ? aRows[0].Id_Usuario : null;

    const [mNRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [matricula_maestro_nuevo]);
    const id_maestro_nuevo = mNRows.length > 0 ? mNRows[0].Id_Usuario : null;

    const [mARows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [matricula_maestro_actual]);
    const id_maestro_actual = mARows.length > 0 ? mARows[0].Id_Usuario : null;

    const [result] = await db.query(
        `INSERT INTO solicitud_cambio_asesor 
         (Id_Alumno, Id_MaestroNuevo, Id_MaestroActual)
         VALUES (?, ?, ?)`,
        [id_alumno, id_maestro_nuevo, id_maestro_actual]
    );
    return result.insertId;
};

// Obtener todas las solicitudes pendientes (para el admin)
export const getSolicitudesPendientes = async () => {
    const [rows] = await db.query(
        `SELECT s.Id_Solicitud, 
                a.Matricula AS MatriculaAlumno, ua.Nombre AS NombreAlumno,
                mn.Matricula AS MatriculaMaestroNuevo, umn.Nombre AS NombreMaestroNuevo,
                ma.Matricula AS MatriculaMaestroActual, uma.Nombre AS NombreMaestroActual,
                s.Estado, s.FechaSolicitud
         FROM solicitud_cambio_asesor s
         INNER JOIN alumnos a ON s.Id_Alumno = a.Id_Usuario
         INNER JOIN usuarios ua ON a.Id_Usuario = ua.Id_Usuario
         INNER JOIN maestros mn ON s.Id_MaestroNuevo = mn.Id_Usuario
         INNER JOIN usuarios umn ON mn.Id_Usuario = umn.Id_Usuario
         INNER JOIN maestros ma ON s.Id_MaestroActual = ma.Id_Usuario
         INNER JOIN usuarios uma ON ma.Id_Usuario = uma.Id_Usuario
         WHERE s.Estado = 'PENDIENTE' 
         ORDER BY s.FechaSolicitud DESC`
    );
    return rows;
};

// Obtener todas las solicitudes (historial)
export const getAllSolicitudes = async () => {
    const [rows] = await db.query(
        `SELECT s.Id_Solicitud, 
                a.Matricula AS MatriculaAlumno, ua.Nombre AS NombreAlumno,
                mn.Matricula AS MatriculaMaestroNuevo, umn.Nombre AS NombreMaestroNuevo,
                ma.Matricula AS MatriculaMaestroActual, uma.Nombre AS NombreMaestroActual,
                s.Estado, s.FechaSolicitud
         FROM solicitud_cambio_asesor s
         INNER JOIN alumnos a ON s.Id_Alumno = a.Id_Usuario
         INNER JOIN usuarios ua ON a.Id_Usuario = ua.Id_Usuario
         INNER JOIN maestros mn ON s.Id_MaestroNuevo = mn.Id_Usuario
         INNER JOIN usuarios umn ON mn.Id_Usuario = umn.Id_Usuario
         INNER JOIN maestros ma ON s.Id_MaestroActual = ma.Id_Usuario
         INNER JOIN usuarios uma ON ma.Id_Usuario = uma.Id_Usuario
         ORDER BY s.FechaSolicitud DESC`
    );
    return rows;
};

// Buscar solicitud por ID
export const findSolicitudById = async (id) => {
    const [rows] = await db.query(
        `SELECT s.*, a.Matricula AS MatriculaAlumno, mn.Matricula AS MatriculaMaestroNuevo
         FROM solicitud_cambio_asesor s
         INNER JOIN alumnos a ON s.Id_Alumno = a.Id_Usuario
         INNER JOIN maestros mn ON s.Id_MaestroNuevo = mn.Id_Usuario
         WHERE s.Id_Solicitud = ?`,
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
