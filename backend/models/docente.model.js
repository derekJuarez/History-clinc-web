import db from '../config/db.js';

// Obtener todos los docentes (usuarios con Id_Rol = 1)
export const getAllDocentes = async () => {
    const [rows] = await db.query(
        'SELECT ID_MATRICULA, NAME, TELEFONO, CORREO FROM usuarios WHERE Id_Rol = 1 ORDER BY NAME ASC'
    );
    return rows;
};

// Buscar un docente por su matrícula
export const findDocenteByMatricula = async (matricula) => {
    const [rows] = await db.query(
        'SELECT * FROM usuarios WHERE ID_MATRICULA = ? AND Id_Rol = 1',
        [matricula]
    );
    return rows[0];
};

// Crear un nuevo docente (insertar en usuarios con Id_Rol = 1)
export const createDocente = async ({ nombre, apellido, matricula, email, telefono, contraseña }) => {
    const fullName = `${nombre} ${apellido}`.trim();
    await db.query(
        'INSERT INTO usuarios (ID_MATRICULA, NAME, TELEFONO, CONTRASEÑA, CORREO, Id_Rol) VALUES (?, ?, ?, ?, ?, 1)',
        [matricula, fullName, telefono, contraseña, email]
    );
    return matricula;
};

// Eliminar un docente por su matrícula
export const deleteDocenteByMatricula = async (matricula) => {
    await db.query(
        'DELETE FROM usuarios WHERE ID_MATRICULA = ? AND Id_Rol = 1',
        [matricula]
    );
};

// Actualizar un docente por su matrícula
export const updateDocenteByMatricula = async (matricula, { nombre, email, telefono, contraseña }) => {
    if (contraseña) {
        await db.query(
            'UPDATE usuarios SET NAME = ?, CORREO = ?, TELEFONO = ?, CONTRASEÑA = ? WHERE ID_MATRICULA = ? AND Id_Rol = 1',
            [nombre, email, telefono, contraseña, matricula]
        );
    } else {
        await db.query(
            'UPDATE usuarios SET NAME = ?, CORREO = ?, TELEFONO = ? WHERE ID_MATRICULA = ? AND Id_Rol = 1',
            [nombre, email, telefono, matricula]
        );
    }
};

