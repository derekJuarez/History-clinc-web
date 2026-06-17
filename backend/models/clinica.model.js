import db from '../config/db.js';

// Obtener todas las clínicas
export const getAllClinicas = async () => {
    const [rows] = await db.query('SELECT * FROM clinicas ORDER BY ID_CLINICA DESC');
    return rows;
};

// Buscar clínica por nombre
export const findClinicaByNombre = async (nombre) => {
    const [rows] = await db.query('SELECT * FROM clinicas WHERE NOMBRE = ?', [nombre]);
    return rows[0];
};

// Insertar una nueva clínica
export const createClinica = async ({ nombre, encargado, ubicacion }) => {
    const [result] = await db.query(
        'INSERT INTO clinicas (NOMBRE, ENCARGADO, UBICACION) VALUES (?, ?, ?)',
        [nombre, encargado, ubicacion]
    );
    return result.insertId;
};

// Eliminar clínica por ID
export const deleteClinica = async (id) => {
    await db.query('DELETE FROM clinicas WHERE ID_CLINICA = ?', [id]);
};
