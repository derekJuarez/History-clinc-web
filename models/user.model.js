import db from '../config/db.js';

// Modelo: Aquí escribes tus consultas SQL directamente
export const findUserByMatricula = async (matricula) => {
    // Ejemplo de consulta usando mysql2/promise
    const [rows] = await db.query('SELECT * FROM usuarios WHERE ID_MATRICULA = ?', [matricula]);
    return rows[0]; // Retorna el primer usuario o undefined
};

// Insertar un nuevo usuario en la base de datos
export const createUser = async ({ nombre, apellido, matricula, email, telefono, contraseña, id_rol, id_maestro = null }) => {
    const fullName = `${nombre} ${apellido}`.trim();
    await db.query(
        'INSERT INTO usuarios (ID_MATRICULA, Nombre, Telefono, Contrasena, Correo, Id_Rol, Id_Maestro) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [matricula, fullName, telefono, contraseña, email, id_rol, id_maestro]
    );
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
        await db.query(
            'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ?, Contrasena = ? WHERE ID_MATRICULA = ?',
            [nombre, email, telefono, contraseña, matricula]
        );
    } else {
        await db.query(
            'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ? WHERE ID_MATRICULA = ?',
            [nombre, email, telefono, matricula]
        );
    }
};
