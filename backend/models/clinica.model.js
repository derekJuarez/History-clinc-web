import db from '../config/db.js';

export const getAllClinicas = async () => {
    const [rows] = await db.query("SELECT * FROM clinicas WHERE ESTADO = 'APROBADO' ORDER BY ID_CLINICA DESC");
    return rows;
};

// Obtener solicitudes de clínicas (pendientes)
export const getSolicitudesClinicas = async () => {
    const [rows] = await db.query("SELECT * FROM clinicas WHERE ESTADO = 'PENDIENTE' ORDER BY ID_CLINICA DESC");
    return rows;
};

// Buscar clínica por nombre
export const findClinicaByNombre = async (nombre) => {
    const [rows] = await db.query('SELECT * FROM clinicas WHERE NOMBRE_CLINICA = ?', [nombre]);
    return rows[0];
};

// Insertar una nueva clínica (con estado opcional)
export const createClinica = async ({ nombre, encargado, ubicacion, estado = 'PENDIENTE' }) => {
    const [result] = await db.query(
        'INSERT INTO clinicas (NOMBRE_CLINICA, ENCARGADO, UBICACION, ESTADO) VALUES (?, ?, ?, ?)',
        [nombre, encargado, ubicacion, estado]
    );
    return result.insertId;
};

// Actualizar estado de clínica
export const updateEstadoClinica = async (id, estado) => {
    await db.query('UPDATE clinicas SET ESTADO = ? WHERE ID_CLINICA = ?', [estado, id]);
};

// Eliminar clínica por ID
export const deleteClinica = async (id) => {
    await db.query('DELETE FROM clinicas WHERE ID_CLINICA = ?', [id]);
};

// Actualizar clínica
export const updateClinica = async (id, { nombre, encargado, ubicacion }) => {
    await db.query(
        'UPDATE clinicas SET NOMBRE_CLINICA = ?, ENCARGADO = ?, UBICACION = ? WHERE ID_CLINICA = ?',
        [nombre, encargado, ubicacion, id]
    );
};

