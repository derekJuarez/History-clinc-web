import db from '../config/db.js';

// Buscar usuario por su identificador (Matrícula de alumno/maestro/admin o CURP de paciente)
export const findUserByMatricula = async (identificador) => {
    const query = `
        SELECT 
            u.Id_Usuario,
            u.Nombre,
            u.Telefono,
            u.Contrasena,
            u.Correo,
            u.Id_Rol,
            COALESCE(a.Matricula, m.Matricula, ad.Matricula, p.CURP) AS ID_MATRICULA
        FROM usuarios u
        LEFT JOIN alumnos a ON u.Id_Usuario = a.Id_Usuario
        LEFT JOIN maestros m ON u.Id_Usuario = m.Id_Usuario
        LEFT JOIN administradores ad ON u.Id_Usuario = ad.Id_Usuario
        LEFT JOIN paciente p ON u.Id_Usuario = p.Id_Usuario
        WHERE a.Matricula = ? OR m.Matricula = ? OR ad.Matricula = ? OR p.CURP = ?
    `;
    const [rows] = await db.query(query, [identificador, identificador, identificador, identificador]);
    return rows[0]; // Retorna el primer usuario o undefined
};

// Insertar un nuevo usuario en la base de datos y en su tabla respectiva
export const createUser = async ({ nombre, apellido, matricula, email, telefono, contraseña, id_rol, id_maestro = null }) => {
    const fullName = `${nombre} ${apellido}`.trim();
    const [result] = await db.query(
        'INSERT INTO usuarios (Nombre, Telefono, Contrasena, Correo, Id_Rol) VALUES (?, ?, ?, ?, ?)',
        [fullName, telefono, contraseña, email, id_rol]
    );
    const newUserId = result.insertId;

    if (id_rol == 1) {
        await db.query('INSERT INTO maestros (Id_Usuario, Matricula) VALUES (?, ?)', [newUserId, matricula]);
    } else if (id_rol == 2) {
        let idMaestroNum = null;
        if (id_maestro) {
             const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [id_maestro]);
             if (mRows.length > 0) idMaestroNum = mRows[0].Id_Usuario;
        }
        await db.query('INSERT INTO alumnos (Id_Usuario, Matricula, Id_Maestro) VALUES (?, ?, ?)', [newUserId, matricula, idMaestroNum]);
    } else if (id_rol == 3) {
        await db.query('INSERT INTO paciente (Id_Usuario, CURP, FechaNacimiento, Sexo) VALUES (?, ?, "2000-01-01", "N/A")', [newUserId, matricula]);
    } else if (id_rol == 4) {
        await db.query('INSERT INTO administradores (Id_Usuario, Matricula) VALUES (?, ?)', [newUserId, matricula]);
    }
    
    return matricula; // Devolvemos la matrícula para compatibilidad con auth.controller
};

export const obtenerTodosMaestros = async () => {
    const query = `
        SELECT 
            m.Matricula AS ID_Matricula, 
            u.Nombre AS Name 
        FROM usuarios u
        INNER JOIN maestros m ON u.Id_Usuario = m.Id_Usuario
        WHERE u.Id_Rol = 1
        ORDER BY u.Nombre ASC
    `;
    const [rows] = await db.query(query);
    return rows;
};

// Actualizar perfil de usuario (autogestión)
export const updateUserProfile = async (matricula, { nombre, email, telefono, contraseña }) => {
    const user = await findUserByMatricula(matricula);
    if (!user) return;
    
    if (contraseña) {
        await db.query(
            'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ?, Contrasena = ? WHERE Id_Usuario = ?',
            [nombre, email, telefono, contraseña, user.Id_Usuario]
        );
    } else {
        await db.query(
            'UPDATE usuarios SET Nombre = ?, Correo = ?, Telefono = ? WHERE Id_Usuario = ?',
            [nombre, email, telefono, user.Id_Usuario]
        );
    }
};
