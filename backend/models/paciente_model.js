import db from '../config/db.js';

// Errores personalizados
export class PacienteDuplicadoError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PacienteDuplicadoError';
        this.status = 409;
    }
}

export class PacienteDeOtroEstudianteError extends Error {
    constructor() {
        super('Este paciente ya está registrado por otro estudiante.');
        this.name = 'PacienteDeOtroEstudianteError';
        this.status = 409;
    }
}

export async function registrarPaciente(pacienteData) {
    const { curp, nombre, telefono, email, fecha_nacimiento, sexo, estado_civil,
        ocupacion, residencia, tel_emergencia, contacto_familiar, id_estudiante } = pacienteData;
    const passwordGenerada = curp.substring(0, 4) + fecha_nacimiento;

    try {
        // ── CASO 1: ¿Existe ya en la tabla usuarios? ─────────────────────────
        const [usuarioRows] = await db.query(
            'SELECT ID_MATRICULA FROM usuarios WHERE ID_MATRICULA = ?',
            [curp]
        );

        if (usuarioRows.length > 0) {
            // ── CASO 2: ¿Tiene registro en la tabla paciente? ─────────────────
            const [pacienteRows] = await db.query(
                'SELECT Id_Paciente, Id_Estudiante_Registro FROM paciente WHERE Id_Usuario = ?',
                [curp]
            );

            if (pacienteRows.length === 0) {
                // Usuario huérfano: existe en usuarios pero NO en paciente
                // → Completar el registro insertando solo en paciente
                const [pacienteResult] = await db.query(
                    `INSERT INTO paciente 
                        (Id_Usuario, FechaNacimiento, Sexo, EstadoCivil, Ocupacion, LugarOrigen, TelefonoEmergencia, ContactoFamiliar, Id_Estudiante_Registro)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [curp, fecha_nacimiento, sexo, estado_civil, ocupacion, residencia, tel_emergencia, contacto_familiar, id_estudiante]
                );
                return { userId: null, pacienteId: pacienteResult.insertId, completado: true };
            }

            const registroExistente = pacienteRows[0];

            if (registroExistente.Id_Estudiante_Registro === id_estudiante) {
                // ── CASO 3: Ya es paciente de ESTE estudiante ─────────────────
                throw new PacienteDuplicadoError('Este paciente ya está en tu lista.');
            } else {
                // ── CASO 4: Es paciente de OTRO estudiante ────────────────────
                throw new PacienteDeOtroEstudianteError();
            }
        }

        // ── CASO 5: No existe en ninguna tabla → registro completo ────────────
        const [userResult] = await db.query(
            'INSERT INTO usuarios (ID_MATRICULA, Nombre, Telefono, Correo, Id_Rol, Contrasena) VALUES (?, ?, ?, ?, ?, ?)',
            [curp, nombre, telefono, email, 4, passwordGenerada]
        );
        const [pacienteResult] = await db.query(
            `INSERT INTO paciente 
                (Id_Usuario, FechaNacimiento, Sexo, EstadoCivil, Ocupacion, LugarOrigen, TelefonoEmergencia, ContactoFamiliar, Id_Estudiante_Registro)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [curp, fecha_nacimiento, sexo, estado_civil, ocupacion, residencia, tel_emergencia, contacto_familiar, id_estudiante]
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
            WHERE u.Id_Rol = 4 AND p.Id_Estudiante_Registro = ?
            GROUP BY p.Id_Paciente, u.ID_MATRICULA, u.Nombre, p.FechaNacimiento, p.Sexo, u.Telefono, u.Correo
        `, [id_estudiante]);
        return rows;
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        throw error;
    }
}
