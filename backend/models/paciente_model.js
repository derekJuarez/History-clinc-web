import db from '../config/db.js';

export async function registrarPaciente(pacienteData) {
    const { curp, nombre, telefono, email, fecha_nacimiento, sexo, estado_civil,
        ocupacion, residencia, tel_emergencia, contacto_familiar, id_estudiante } = pacienteData;
    // Se toma las primeras 4 letras de la CURP y se concatena con la fecha de nacimiento para generar la contraseña
    const passwordGenerada = curp.substring(0, 4) + fecha_nacimiento;
    try {
        // Insertar en tabla usuarios
        const [userResult] = await db.query(
            'INSERT INTO usuarios (ID_Matricula, Name, Telefono, Correo, Id_Rol, Contraseña) VALUES (?, ?, ?, ?, ?, ?)',
            [curp, nombre, telefono, email, 4, passwordGenerada] // 4 = Paciente
        );
        // Insertar en tabla paciente
        const [pacienteResult] = await db.query(
            'INSERT INTO paciente (Id_usuario, Fecha_Nacimiento, Sexo, Estado_Civil, Ocupacion, Lugar_Origen_Residencia, Telefono_Emergencia, Contacto_Familiar, Id_Estudiante_Registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [curp, fecha_nacimiento, sexo, estado_civil, ocupacion, residencia, tel_emergencia, contacto_familiar, id_estudiante ]
        );
        return { userId: userResult.insertId, pacienteId: pacienteResult.insertId };
    } catch (error) {
        console.error('Error al registrar paciente:', error);
        throw error;
    }
}

export async function obtenerPacientes(id_estudiante) {
    const [rows] = await db.query(`
        SELECT
            p.Id_Paciente AS id_paciente, 
            u.ID_Matricula AS curp, 
            u.Name AS nombre, 
            p.Fecha_Nacimiento AS fecha_nacimiento, 
            p.Sexo AS sexo, 
            u.Telefono AS telefono, 
            u.Correo AS correo,
            MAX(c.Radio_Bucales) AS radiografia_reciente
        FROM usuarios u
        INNER JOIN paciente p ON u.ID_Matricula = p.Id_Usuario
        LEFT JOIN citas c ON p.Id_Paciente = c.Id_Paciente
        WHERE u.Id_Rol = 4 AND p.Id_Estudiante_Registro = ?
        GROUP BY p.Id_Paciente, u.ID_Matricula, u.Name, p.Fecha_Nacimiento, p.Sexo, u.Telefono, u.Correo
    `, [id_estudiante]);
    return rows;
}
