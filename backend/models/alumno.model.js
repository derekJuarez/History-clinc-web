import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Obtener todos los alumnos desde la tabla usuarios con rol 2
export const getAllAlumnos = async () => {
    const [rows] = await db.query(
        `SELECT a.Matricula AS ID_MATRICULA, u.Nombre, u.Correo, u.Telefono 
         FROM usuarios u 
         INNER JOIN alumnos a ON u.Id_Usuario = a.Id_Usuario 
         ORDER BY u.Nombre ASC`
    );
    return rows;
};

// Buscar alumno por matrícula
export const findAlumnoByMatricula = async (matricula) => {
    const [rows] = await db.query(
        `SELECT u.*, a.Matricula AS ID_MATRICULA, a.Id_Maestro 
         FROM usuarios u 
         INNER JOIN alumnos a ON u.Id_Usuario = a.Id_Usuario 
         WHERE a.Matricula = ?`,
        [matricula]
    );
    return rows[0];
};

// Buscar alumno en la tabla usuarios por matrícula
export const findAlumnoEnUsuariosByMatricula = async (matricula) => {
    const [rows] = await db.query(
        `SELECT a.Matricula AS ID_MATRICULA, u.Nombre, 
                (SELECT m.Matricula FROM maestros m WHERE m.Id_Usuario = a.Id_Maestro) AS Id_Maestro 
         FROM usuarios u 
         INNER JOIN alumnos a ON u.Id_Usuario = a.Id_Usuario 
         WHERE a.Matricula = ?`,
        [matricula]
    );
    return rows[0];
};

// Crear alumno en la tabla usuarios con maestro asignado
export const crearAlumnoEnUsuarios = async ({ nombre, matricula, contraseña, id_maestro }) => {
    const correo = `${matricula.toLowerCase()}@umich.mx`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);
    
    const [uResult] = await db.query(
        'INSERT INTO usuarios (Nombre, Contrasena, Correo, Id_Rol, ID_MATRICULA) VALUES (?, ?, ?, 2, ?)',
        [nombre, hashedPassword, correo, matricula]
    );
    const idUsuario = uResult.insertId;
    
    let idMaestroNum = null;
    if (id_maestro) {
         const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [id_maestro]);
         if (mRows.length > 0) idMaestroNum = mRows[0].Id_Usuario;
    }
    
    await db.query(
        'INSERT INTO alumnos (Id_Usuario, Matricula, Id_Maestro) VALUES (?, ?, ?)',
        [idUsuario, matricula, idMaestroNum]
    );
    return matricula;
};

// Eliminar alumno por matrícula
export const deleteAlumno = async (matricula) => {
    // Al estar ON DELETE CASCADE en Id_Usuario, eliminando de usuarios se borra de alumnos
    const [aRows] = await db.query('SELECT Id_Usuario FROM alumnos WHERE Matricula = ?', [matricula]);
    if (aRows.length > 0) {
        await db.query('DELETE FROM usuarios WHERE Id_Usuario = ?', [aRows[0].Id_Usuario]);
    }
};

// Actualizar el maestro asignado a un alumno
export const actualizarMaestroDeAlumno = async (matricula, id_maestro) => {
    let idMaestroNum = null;
    if (id_maestro) {
         const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [id_maestro]);
         if (mRows.length > 0) idMaestroNum = mRows[0].Id_Usuario;
    }
    await db.query(
        'UPDATE alumnos SET Id_Maestro = ? WHERE Matricula = ?',
        [idMaestroNum, matricula]
    );
};

// Obtener los alumnos a cargo de un maestro
export const obtenerAlumnosDeMaestro = async (maestroMatricula) => {
    // Primero buscar el Id_Usuario del maestro
    const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [maestroMatricula]);
    if (mRows.length === 0) return [];
    const idMaestroNum = mRows[0].Id_Usuario;
    
    const query = `
        SELECT 
            a.Matricula AS matricula,
            u.Nombre AS nombre,
            u.Correo AS correo,
            u.Telefono AS telefono,
            (
                SELECT c.Nombre 
                FROM clinicas c
                WHERE c.Id_Maestro_Encargado = ?
                  AND c.Estado = 'APROBADO'
                LIMIT 1
            ) AS clinica,
            (
                SELECT COUNT(DISTINCT Id_Paciente)
                FROM citas
                WHERE Id_Estudiante = a.Id_Usuario AND Estado = 'Completa'
            ) AS pacientes
        FROM usuarios u
        INNER JOIN alumnos a ON u.Id_Usuario = a.Id_Usuario
        WHERE a.Id_Maestro = ? 
        ORDER BY u.Nombre ASC
    `;
    try {
        const [rows] = await db.query(query, [idMaestroNum, idMaestroNum]);
        return rows;
    } catch (error) {
        console.error('Error en obtenerAlumnosDeMaestro:', error);
        throw error;
    }
};

// Actualizar los datos de un alumno
export const updateAlumno = async (matricula, { nombre, correo, telefono }) => {
    const [aRows] = await db.query('SELECT Id_Usuario FROM alumnos WHERE Matricula = ?', [matricula]);
    if (aRows.length > 0) {
        await db.query(
            'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ? WHERE Id_Usuario = ?',
            [nombre, correo, telefono, aRows[0].Id_Usuario]
        );
    }
};

// Obtener información del maestro asociado al alumno
export const getMaestroDeAlumno = async (matriculaAlumno) => {
    const query = `
        SELECT 
            mu.Nombre AS nombre,
            mu.Telefono AS telefono,
            (
                SELECT c.Ubicacion
                FROM clinicas c
                WHERE c.Id_Maestro_Encargado = m.Id_Usuario 
                LIMIT 1
            ) AS clinica_ubicacion,
            (
                SELECT c.Cedula_Profesional
                FROM clinicas c
                WHERE c.Id_Maestro_Encargado = m.Id_Usuario 
                LIMIT 1
            ) AS clinica_cedula
        FROM alumnos a
        INNER JOIN maestros m ON a.Id_Maestro = m.Id_Usuario
        INNER JOIN usuarios mu ON m.Id_Usuario = mu.Id_Usuario
        WHERE a.Matricula = ?
    `;
    try {
        const [rows] = await db.query(query, [matriculaAlumno]);
        return rows[0];
    } catch (error) {
        console.error('Error en getMaestroDeAlumno:', error);
        throw error;
    }
};
