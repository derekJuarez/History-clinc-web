import db from '../config/db.js';

// Modelo: Aquí escribes tus consultas SQL directamente
export const findUserByMatricula = async (matricula) => {
    // Ejemplo de consulta usando mysql2/promise
    const [rows] = await db.query('SELECT * FROM usuarios WHERE ID_Matricula = ?', [matricula]);
    return rows[0]; // Retorna el primer usuario o undefined
};

// Insertar un nuevo usuario en la base de datos
export const createUser = async ({ nombre, apellido, matricula, email, telefono, contraseña, id_rol, id_maestro = null }) => {
    const fullName = `${nombre} ${apellido}`.trim();
    await db.query(
        'INSERT INTO usuarios (ID_Matricula, Name, Telefono, Contraseña, Correo, Id_Rol, ID_MAESTRO) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [matricula, fullName, telefono, contraseña, email, id_rol, id_maestro]
    );
    return matricula;
};

export const obtenerTodosMaestros = async () => {
    const query = `
        SELECT 
            u.ID_Matricula AS ID_Matricula, 
            u.Name AS Name 
        FROM usuarios u
        WHERE u.Id_Rol = 1
        ORDER BY u.Name ASC
    `;
    const [rows] = await db.query(query);
    return rows;
};
