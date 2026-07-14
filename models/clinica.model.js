import db from '../config/db.js';

export const getAllClinicas = async () => {
    const [rows] = await db.query("SELECT * FROM clinicas WHERE Estado = 'APROBADO' ORDER BY ID_CLINICA DESC");
    return rows;
};

// Obtener solicitudes de clínicas (pendientes)
export const getSolicitudesClinicas = async () => {
    const [rows] = await db.query("SELECT * FROM clinicas WHERE Estado = 'PENDIENTE' ORDER BY ID_CLINICA DESC");
    return rows;
};

// Buscar clínica por nombre
export const findClinicaByNombre = async (nombre) => {
    const [rows] = await db.query('SELECT * FROM clinicas WHERE Nombre = ?', [nombre]);
    return rows[0];
};

// Insertar una nueva clínica (con estado opcional)
export const createClinica = async ({ nombre, encargado, ubicacion, estado = 'PENDIENTE' }) => {
    const [result] = await db.query(
        'INSERT INTO clinicas (Nombre, Encargado, Ubicacion, Estado) VALUES (?, ?, ?, ?)',
        [nombre, encargado, ubicacion, estado]
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
export const updateClinica = async (id, { nombre, encargado, ubicacion }) => {
    await db.query(
        'UPDATE clinicas SET Nombre = ?, Encargado = ?, Ubicacion = ? WHERE ID_CLINICA = ?',
        [nombre, encargado, ubicacion, id]
    );
};

