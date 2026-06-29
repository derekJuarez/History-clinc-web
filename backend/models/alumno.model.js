import db from '../config/db.js';

// Obtener todos los alumnos
export const getAllAlumnos = async () => {
    const [rows] = await db.query('SELECT * FROM alumnos ORDER BY ID_ALUMNO DESC');
    return rows;
};

// Buscar alumno por matrícula
export const findAlumnoByMatricula = async (matricula) => {
    const [rows] = await db.query('SELECT * FROM alumnos WHERE MATRICULA = ?', [matricula]);
    return rows[0];
};

// Insertar un nuevo alumno
export const createAlumno = async ({ nombre, matricula, unidad_clinica }) => {
    const [result] = await db.query(
        'INSERT INTO alumnos (NOMBRE, MATRICULA, UNIDAD_CLINICA) VALUES (?, ?, ?)',
        [nombre, matricula, unidad_clinica]
    );
    return result.insertId;
};

// Eliminar alumno por ID
export const deleteAlumno = async (id) => {
    await db.query('DELETE FROM alumnos WHERE ID_ALUMNO = ?', [id]);
};

// Obtener los alumnos a cargo de un maestro en su clínica
export const obtenerAlumnosDeMaestro = async (maestroMatricula) => {
    const query = `
        SELECT 
            u.ID_MATRICULA AS matricula,
            u.NAME AS nombre,
            c.NOMBRE_CLINICA AS clinica
        FROM usuarios u
        LEFT JOIN usuarios m ON u.ID_MAESTRO = m.ID_MATRICULA
        LEFT JOIN clinicas c ON c.ENCARGADO = m.NAME
        WHERE u.ID_MAESTRO = ? AND u.Id_Rol = 2
    `;
    const [rows] = await db.query(query, [maestroMatricula]);
    return rows;
};
