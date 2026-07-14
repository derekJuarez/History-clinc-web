import db from '../config/db.js';

// Obtener todos los alumnos desde la tabla usuarios con rol 2
export const getAllAlumnos = async () => {
    const [rows] = await db.query(
        `SELECT ID_MATRICULA, Nombre, Correo, Telefono FROM usuarios WHERE Id_Rol = 2 ORDER BY Nombre ASC`
    );
    return rows;
};

// Buscar alumno por matrícula en tabla usuarios (rol 2)
export const findAlumnoByMatricula = async (matricula) => {
    const [rows] = await db.query(
        'SELECT * FROM usuarios WHERE ID_MATRICULA = ? AND Id_Rol = 2',
        [matricula]
    );
    return rows[0];
};

// Buscar alumno en la tabla usuarios por matrícula (rol 2)
export const findAlumnoEnUsuariosByMatricula = async (matricula) => {
    const [rows] = await db.query(
        'SELECT ID_MATRICULA, Nombre, Id_Maestro FROM usuarios WHERE ID_MATRICULA = ? AND Id_Rol = 2',
        [matricula]
    );
    return rows[0];
};

// Crear alumno en la tabla usuarios con maestro asignado
export const crearAlumnoEnUsuarios = async ({ nombre, matricula, contraseña, id_maestro }) => {
    const correo = `${matricula.toLowerCase()}@umich.mx`;
    await db.query(
        'INSERT INTO usuarios (ID_MATRICULA, Nombre, Contrasena, Correo, Id_Rol, Id_Maestro) VALUES (?, ?, ?, ?, 2, ?)',
        [matricula, nombre, contraseña, correo, id_maestro]
    );
    return matricula;
};

// Eliminar alumno por matrícula
export const deleteAlumno = async (matricula) => {
    await db.query('DELETE FROM usuarios WHERE ID_MATRICULA = ? AND Id_Rol = 2', [matricula]);
};

// Actualizar el maestro asignado a un alumno en usuarios
export const actualizarMaestroDeAlumno = async (matricula, id_maestro) => {
    await db.query(
        'UPDATE usuarios SET Id_Maestro = ? WHERE ID_MATRICULA = ? AND Id_Rol = 2',
        [id_maestro, matricula]
    );
};

// Obtener los alumnos a cargo de un maestro
// La columna Encargado en clinicas puede guardar el nombre O la matrícula del maestro,
// por eso se busca contra ambas posibilidades. Usamos REPLACE para soportar nombres incompletos (ej. "Mauricio Reyes").
export const obtenerAlumnosDeMaestro = async (maestroMatricula) => {
    const query = `
        SELECT 
            u.ID_MATRICULA AS matricula,
            u.Nombre AS nombre,
            u.Correo AS correo,
            u.Telefono AS telefono,
            (
                SELECT c.Nombre 
                FROM clinicas c
                INNER JOIN usuarios m ON m.ID_MATRICULA = ?
                WHERE (
                    c.Encargado = m.ID_MATRICULA 
                    OR m.Nombre LIKE CONCAT('%', REPLACE(c.Encargado, ' ', '%'), '%')
                )
                  AND c.Estado = 'APROBADO'
                LIMIT 1
            ) AS clinica,
            (
                SELECT COUNT(DISTINCT Id_Paciente)
                FROM citas
                WHERE Id_Estudiante = u.ID_MATRICULA AND Estado = 'Completa'
            ) AS pacientes
        FROM usuarios u
        WHERE u.Id_Maestro = ? AND u.Id_Rol = 2
        ORDER BY u.Nombre ASC
    `;
    try {
        const [rows] = await db.query(query, [maestroMatricula, maestroMatricula, maestroMatricula]);
        return rows;
    } catch (error) {
        console.error('Error en obtenerAlumnosDeMaestro:', error);
        throw error;
    }
};

// Actualizar los datos de un alumno
export const updateAlumno = async (matricula, { nombre, correo, telefono }) => {
    await db.query(
        'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ? WHERE ID_MATRICULA = ? AND Id_Rol = 2',
        [nombre, correo, telefono, matricula]
    );
};
