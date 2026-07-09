import db from '../config/db.js';

// Obtener todos los alumnos
export const getAllAlumnos = async () => {
    const [rows] = await db.query('SELECT * FROM alumnos ORDER BY ID_ALUMNO DESC');
    return rows;
};

// Buscar alumno por matrícula (tabla alumnos legacy)
export const findAlumnoByMatricula = async (matricula) => {
    const [rows] = await db.query('SELECT * FROM alumnos WHERE MATRICULA = ?', [matricula]);
    return rows[0];
};

// Insertar un nuevo alumno (tabla alumnos legacy)
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
            c.NOMBRE_CLINICA AS clinica,
            (SELECT COUNT(DISTINCT NOMBRE_PACIENTE) FROM informes_clinicos WHERE MATRICULA_ALUMNO = u.ID_MATRICULA) AS pacientes
        FROM usuarios u
        LEFT JOIN usuarios m ON u.ID_MAESTRO = m.ID_MATRICULA
        LEFT JOIN clinicas c ON c.ENCARGADO = m.NAME
        WHERE u.ID_MAESTRO = ? AND u.Id_Rol = 2
    `;
    const [rows] = await db.query(query, [maestroMatricula]);
    return rows;
};

// ─── Funciones sobre tabla usuarios (alumnos reales con rol 2) ───────────────

// Buscar alumno en la tabla usuarios por matrícula (rol 2)
export const findAlumnoEnUsuariosByMatricula = async (matricula) => {
    const [rows] = await db.query(
        'SELECT ID_MATRICULA, NAME, ID_MAESTRO FROM usuarios WHERE ID_MATRICULA = ? AND Id_Rol = 2',
        [matricula]
    );
    return rows[0];
};

// Crear alumno en la tabla usuarios con maestro asignado
export const crearAlumnoEnUsuarios = async ({ nombre, matricula, contraseña, id_maestro }) => {
    await db.query(
        'INSERT INTO usuarios (ID_MATRICULA, NAME, CONTRASEÑA, Id_Rol, ID_MAESTRO) VALUES (?, ?, ?, 2, ?)',
        [matricula, nombre, contraseña, id_maestro]
    );
    return matricula;
};

// Actualizar el maestro asignado a un alumno en usuarios
export const actualizarMaestroDeAlumno = async (matricula, id_maestro) => {
    await db.query(
        'UPDATE usuarios SET ID_MAESTRO = ? WHERE ID_MATRICULA = ? AND Id_Rol = 2',
        [id_maestro, matricula]
    );
};
