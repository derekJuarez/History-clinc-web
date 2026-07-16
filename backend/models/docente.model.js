import db from '../config/db.js';

// Obtener todos los docentes (usuarios con Id_Rol = 1)
export const getAllDocentes = async () => {
    const [rows] = await db.query(
        `SELECT m.Matricula AS ID_MATRICULA, u.Nombre, u.Telefono, u.Correo 
         FROM usuarios u 
         INNER JOIN maestros m ON u.Id_Usuario = m.Id_Usuario 
         WHERE u.Id_Rol = 1 
         ORDER BY u.Nombre ASC`
    );
    return rows;
};

// Buscar un docente por su matrícula
export const findDocenteByMatricula = async (matricula) => {
    const [rows] = await db.query(
        `SELECT u.*, m.Matricula AS ID_MATRICULA 
         FROM usuarios u 
         INNER JOIN maestros m ON u.Id_Usuario = m.Id_Usuario 
         WHERE m.Matricula = ? AND u.Id_Rol = 1`,
        [matricula]
    );
    return rows[0];
};

// Crear un nuevo docente (insertar en usuarios y luego en maestros)
export const createDocente = async ({ nombre, apellido, matricula, email, telefono, contraseña }) => {
    const fullName = `${nombre} ${apellido}`.trim();
    const [uResult] = await db.query(
        'INSERT INTO usuarios (Nombre, Telefono, Contrasena, Correo, Id_Rol) VALUES (?, ?, ?, ?, 1)',
        [fullName, telefono, contraseña, email]
    );
    const newUserId = uResult.insertId;
    
    await db.query('INSERT INTO maestros (Id_Usuario, Matricula) VALUES (?, ?)', [newUserId, matricula]);
    return matricula;
};

// Eliminar un docente por su matrícula
export const deleteDocenteByMatricula = async (matricula) => {
    const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [matricula]);
    if (mRows.length > 0) {
        await db.query('DELETE FROM usuarios WHERE Id_Usuario = ?', [mRows[0].Id_Usuario]);
    }
};

// Actualizar un docente por su matrícula
export const updateDocenteByMatricula = async (matricula, { nombre, email, telefono, contraseña }) => {
    const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [matricula]);
    if (mRows.length === 0) return;
    const idUsuario = mRows[0].Id_Usuario;

    if (contraseña) {
        await db.query(
            'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ?, Contrasena = ? WHERE Id_Usuario = ?',
            [nombre, email, telefono, contraseña, idUsuario]
        );
    } else {
        await db.query(
            'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ? WHERE Id_Usuario = ?',
            [nombre, email, telefono, idUsuario]
        );
    }
};
