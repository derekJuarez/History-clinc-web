import db from '../config/db.js';

// Modelo: Aquí escribes tus consultas SQL directamente
export const findUserByMatricula = async (matricula) => {
    // Ejemplo de consulta usando mysql2/promise
    const [rows] = await db.query('SELECT * FROM usuarios WHERE ID_Matricula = ?', [matricula]);
    return rows[0]; // Retorna el primer usuario o undefined
};

// Insertar un nuevo usuario en la base de datos
export const createUser = async ({ nombre, apellido, matricula, email, telefono, contraseña, id_rol }) => {
    const [result] = await db.query(
        'INSERT INTO usuarios (NOMBRE, APELLIDO, ID_MATRICULA, EMAIL, TELEFONO, CONTRASEÑA, Id_Rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre, apellido, matricula, email, telefono, contraseña, id_rol]
    );
    return result.insertId;
};

