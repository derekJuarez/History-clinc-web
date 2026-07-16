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
        // Buscar el Id_Usuario numérico del estudiante que lo está registrando
        const [aRows] = await db.query('SELECT Id_Usuario FROM alumnos WHERE Matricula = ?', [id_estudiante]);
        const id_estudiante_num = aRows.length > 0 ? aRows[0].Id_Usuario : null;

        // ── CASO 1: ¿Existe ya en la tabla paciente? ─────────────────────────
        const [pacienteRows] = await db.query(
            'SELECT Id_Paciente, Id_Estudiante_Registro, Id_Usuario FROM paciente WHERE CURP = ?',
            [curp]
        );

        if (pacienteRows.length > 0) {
            const registroExistente = pacienteRows[0];
            if (registroExistente.Id_Estudiante_Registro === id_estudiante_num) {
                // ── CASO 3: Ya es paciente de ESTE estudiante ─────────────────
                throw new PacienteDuplicadoError('Este paciente ya está en tu lista.');
            } else {
                // ── CASO 4: Es paciente de OTRO estudiante ────────────────────
                throw new PacienteDeOtroEstudianteError();
            }
        }

        // ── CASO 5: No existe en ninguna tabla → registro completo ────────────
        const [userResult] = await db.query(
            'INSERT INTO usuarios (Nombre, Telefono, Correo, Id_Rol, Contrasena) VALUES (?, ?, ?, 3, ?)',
            [nombre, telefono, email, passwordGenerada]
        );
        const idUsuario = userResult.insertId;

        const [pacienteResult] = await db.query(
            'INSERT INTO paciente (Id_Usuario, CURP, FechaNacimiento, Sexo, EstadoCivil, Ocupacion, LugarOrigen, TelefonoEmergencia, ContactoFamiliar, Id_Estudiante_Registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [idUsuario, curp, fecha_nacimiento, sexo, estado_civil, ocupacion, residencia, tel_emergencia, contacto_familiar, id_estudiante_num]
        );
        return { userId: idUsuario, pacienteId: pacienteResult.insertId };
    } catch (error) {
        console.error('Error al registrar paciente:', error);
        throw error;
    }
}

export async function obtenerPacientes(id_estudiante_matricula) {
    try {
        const [aRows] = await db.query('SELECT Id_Usuario FROM alumnos WHERE Matricula = ?', [id_estudiante_matricula]);
        if (aRows.length === 0) return [];
        const id_estudiante_num = aRows[0].Id_Usuario;

        const [rows] = await db.query(`
            SELECT
                p.Id_Paciente AS id_paciente, 
                p.CURP AS curp, 
                u.Nombre AS nombre, 
                p.FechaNacimiento AS fecha_nacimiento, 
                p.Sexo AS sexo, 
                u.Telefono AS telefono, 
                u.Correo AS correo,
                MAX(c.Radio_Bucales) AS radiografia_reciente
            FROM usuarios u
            INNER JOIN paciente p ON u.Id_Usuario = p.Id_Usuario
            LEFT JOIN citas c ON p.Id_Paciente = c.Id_Paciente
            WHERE u.Id_Rol = 3 AND p.Id_Estudiante_Registro = ?
            GROUP BY p.Id_Paciente, p.CURP, u.Nombre, p.FechaNacimiento, p.Sexo, u.Telefono, u.Correo
        `, [id_estudiante_num]);
        return rows;
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        throw error;
    }
}
