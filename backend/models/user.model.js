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
        'INSERT INTO usuarios (ID_MATRICULA, NAME, TELEFONO, CONTRASEÑA, CORREO, Id_Rol, ID_MAESTRO) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [matricula, fullName, telefono, contraseña, email, id_rol, id_maestro]
    );
    return matricula;
};

export const obtenerTodosMaestros = async () => {
    const query = `
        SELECT DISTINCT 
            u.ID_MATRICULA AS ID_Matricula, 
            u.NAME AS Name 
        FROM usuarios u
        JOIN clinicas c ON c.ENCARGADO = u.NAME
        WHERE u.Id_Rol = 1
    `;
    const [rows] = await db.query(query);
    return rows;
};
