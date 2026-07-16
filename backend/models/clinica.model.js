import db from '../config/db.js';

export const getAllClinicas = async () => {
    const [rows] = await db.query(`
        SELECT c.*, m.Matricula AS Encargado, u.Nombre AS Nombre_Encargado
        FROM clinicas c
        INNER JOIN maestros m ON c.Id_Maestro_Encargado = m.Id_Usuario
        INNER JOIN usuarios u ON m.Id_Usuario = u.Id_Usuario
        WHERE c.Estado = 'APROBADO' 
        ORDER BY c.ID_CLINICA DESC
    `);
    return rows;
};

// Obtener solicitudes de clínicas (pendientes)
export const getSolicitudesClinicas = async () => {
    const [rows] = await db.query(`
        SELECT c.*, m.Matricula AS Encargado, u.Nombre AS Nombre_Encargado
        FROM clinicas c
        INNER JOIN maestros m ON c.Id_Maestro_Encargado = m.Id_Usuario
        INNER JOIN usuarios u ON m.Id_Usuario = u.Id_Usuario
        WHERE c.Estado = 'PENDIENTE' 
        ORDER BY c.ID_CLINICA DESC
    `);
    return rows;
};

// Buscar clínica por nombre
export const findClinicaByNombre = async (nombre) => {
    const [rows] = await db.query('SELECT * FROM clinicas WHERE Nombre = ?', [nombre]);
    return rows[0];
};

// Insertar una nueva clínica (con estado opcional)
export const createClinica = async ({ nombre, encargado, ubicacion, cedula, estado = 'PENDIENTE' }) => {
    // Buscar Id_Usuario numérico del encargado (maestro)
    const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [encargado]);
    const id_encargado_num = mRows.length > 0 ? mRows[0].Id_Usuario : null;

    const [result] = await db.query(
        'INSERT INTO clinicas (Nombre, Id_Maestro_Encargado, Ubicacion, Cedula_Profesional, Estado) VALUES (?, ?, ?, ?, ?)',
        [nombre, id_encargado_num, ubicacion, cedula || '', estado]
    );
    return result.insertId;
};

// Actualizar estado de clínica
export const updateEstadoClinica = async (id, estado) => {
    await db.query('UPDATE clinicas SET Estado = ? WHERE ID_CLINICA = ?', [estado, id]);
};

// Eliminar clínica por ID
export const deleteClinica = async (id) => {
    await db.query('DELETE FROM clinicas WHERE ID_CLINICA = ?', [id]);
};

// Actualizar clínica
export const updateClinica = async (id, { nombre, encargado, ubicacion, cedula }) => {
    const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [encargado]);
    const id_encargado_num = mRows.length > 0 ? mRows[0].Id_Usuario : null;

    await db.query(
        'UPDATE clinicas SET Nombre = ?, Id_Maestro_Encargado = ?, Ubicacion = ?, Cedula_Profesional = ? WHERE ID_CLINICA = ?',
        [nombre, id_encargado_num, ubicacion, cedula || '', id]
    );
};
