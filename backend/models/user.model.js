import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Modelo: Aquí escribes tus consultas SQL directamente
export const findUserByMatricula = async (matricula) => {
    // Ejemplo de consulta usando mysql2/promise
    const [rows] = await db.query('SELECT * FROM usuarios WHERE ID_MATRICULA = ?', [matricula]);
    return rows[0]; // Retorna el primer usuario o undefined
};

// Insertar un nuevo usuario en la base de datos
export const createUser = async ({ nombre, apellido, matricula, email, telefono, contraseña, id_rol, id_maestro = null }) => {
    const fullName = `${nombre} ${apellido}`.trim();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    const [result] = await db.query(
        'INSERT INTO usuarios (ID_MATRICULA, Nombre, Telefono, Contrasena, Correo, Id_Rol, Id_Maestro) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [matricula, fullName, telefono, hashedPassword, email, id_rol, id_maestro]
    );

    const newUserId = result.insertId;

    if (id_rol === 1) { // Maestro
        await db.query('INSERT INTO maestros (Id_Usuario, Matricula) VALUES (?, ?)', [newUserId, matricula]);
    } else if (id_rol === 2) { // Alumno
        let id_maestro_int = null;
        if (id_maestro) {
            const [maestroRes] = await db.query('SELECT Id_Usuario FROM usuarios WHERE ID_MATRICULA = ?', [id_maestro]);
            if (maestroRes.length > 0) {
                id_maestro_int = maestroRes[0].Id_Usuario;
            }
        }
        await db.query('INSERT INTO alumnos (Id_Usuario, Matricula, Id_Maestro) VALUES (?, ?, ?)', [newUserId, matricula, id_maestro_int]);
    } else if (id_rol === 4) { // Administrador
        await db.query('INSERT INTO administradores (Id_Usuario, Matricula) VALUES (?, ?)', [newUserId, matricula]);
    }

    return matricula;
};

export const obtenerTodosMaestros = async () => {
    const query = `
        SELECT 
            u.ID_MATRICULA AS ID_Matricula, 
            u.Nombre AS Name 
        FROM usuarios u
        WHERE u.Id_Rol = 1
        ORDER BY u.Nombre ASC
    `;
    const [rows] = await db.query(query);
    return rows;
};

// Actualizar perfil de usuario (autogestión)
export const updateUserProfile = async (matricula, { nombre, email, telefono, contraseña }) => {
    if (contraseña) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);
        await db.query(
            'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ?, Contrasena = ? WHERE ID_MATRICULA = ?',
            [nombre, email, telefono, hashedPassword, matricula]
        );
    } else {
        await db.query(
            'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ? WHERE ID_MATRICULA = ?',
            [nombre, email, telefono, matricula]
        );
    }
};
