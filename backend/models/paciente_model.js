import db from '../config/db.js';

export async function registrarPaciente(pacienteData) {
    const { curp, nombre, telefono, email, fecha_nacimiento, sexo, estado_civil, 
        ocupacion, residencia, tel_emergencia, contacto_familiar } = pacienteData;
        // Se toma las primeras 4 letras de la CURP y se concatena con la fecha de nacimiento para generar la contraseña
        const passwordGenerada = curp.substring(0, 4) + fecha_nacimiento; 
    try {
        // Insertar en tabla usuarios
        const [userResult] = await db.query(
            'INSERT INTO usuarios (ID_Matricula, Name, Telefono, Correo, Id_Rol, Contraseña) VALUES (?, ?, ?, ?, ?, ?)',
            [curp, nombre, telefono, email, 3, passwordGenerada] // 3 = Paciente
        );
        // Insertar en tabla paciente
        const [pacienteResult] = await db.query(
            'INSERT INTO paciente (Id_usuario, Fecha_Nacimiento, Sexo, Estado_Civil, Ocupacion, Residencia, Telefono_Emergencia, Contacto_Familiar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [curp, fecha_nacimiento, sexo, estado_civil, ocupacion, residencia, tel_emergencia, contacto_familiar]
        );
        return { userId: userResult.insertId, pacienteId: pacienteResult.insertId };
    } catch (error) {
        console.error('Error al registrar paciente:', error);
        throw error;
    }
}