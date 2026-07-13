import db from '../config/db.js';

export async function registrarPaciente(pacienteData) {
    const { curp, nombre, telefono, email, fecha_nacimiento, sexo, estado_civil,
        ocupacion, residencia, tel_emergencia, contacto_familiar, id_estudiante } = pacienteData;
    // Se toma las primeras 4 letras de la CURP y se concatena con la fecha de nacimiento para generar la contraseña
    const passwordGenerada = curp.substring(0, 4) + fecha_nacimiento;
    try {
        // Insertar en tabla usuarios
        const [userResult] = await db.query(
            'INSERT INTO usuarios (ID_MATRICULA, Nombre, Telefono, Correo, Id_Rol, Contrasena) VALUES (?, ?, ?, ?, ?, ?)',
            [curp, nombre, telefono, email, 4, passwordGenerada] // 4 = Paciente
        );
        // Insertar en tabla paciente (columnas verificadas contra informe.model.js)
        const [pacienteResult] = await db.query(
            'INSERT INTO paciente (Id_Usuario, FechaNacimiento, Sexo, Ocupacion, TelefonoEmergencia) VALUES (?, ?, ?, ?, ?)',
            [curp, fecha_nacimiento, sexo, ocupacion, tel_emergencia]
        );
        return { userId: userResult.insertId, pacienteId: pacienteResult.insertId };
    } catch (error) {
        console.error('Error al registrar paciente:', error);
        throw error;
    }
}

export async function obtenerPacientes(id_estudiante) {
    try {
        const [rows] = await db.query(`
            SELECT
                p.Id_Paciente AS id_paciente, 
                u.ID_MATRICULA AS curp, 
                u.Nombre AS nombre, 
                p.FechaNacimiento AS fecha_nacimiento, 
                p.Sexo AS sexo, 
                u.Telefono AS telefono, 
                u.Correo AS correo,
                MAX(c.Radio_Bucales) AS radiografia_reciente
            FROM usuarios u
            INNER JOIN paciente p ON u.ID_MATRICULA = p.Id_Usuario
            LEFT JOIN citas c ON p.Id_Paciente = c.Id_Paciente
            WHERE u.Id_Rol = 4
            GROUP BY p.Id_Paciente, u.ID_MATRICULA, u.Nombre, p.FechaNacimiento, p.Sexo, u.Telefono, u.Correo
        `);
        return rows;
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        throw error;
    }
}
