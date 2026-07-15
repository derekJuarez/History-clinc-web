import db from '../config/db.js';

// Guardar un informe clínico enviado por un alumno
export const guardarInforme = async ({
    matricula_alumno,
    nombre_alumno,
    nombre_paciente,
    telefono_paciente,
    fecha_nac_paciente,
    sexo_paciente,
    ocupacion_paciente,
    higiene_oral,
    habitos,
    oclusion,
    estado_atm,
    diagnostico,
    plan_tratamiento,
    odontograma_json,
    
    medico_cabecera,
    tabaquismo,
    alcoholismo,
    drogadiccion,
    cardiovascular_data,
    endocrino_data,
    hematologico_data,
    infectocontagiosas_data,
    alergias_flags,
    medicamentos_actuales
}) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Crear un Usuario Fantasma para el Paciente
        const pseudoCURP = `PAC-${Date.now()}`;
        const contrasenaPhantom = 'paciente123'; // O generar un hash si usaran bcrypt
        const [resUser] = await connection.query(
            `INSERT INTO usuarios (Nombre, Telefono, Contrasena, Correo, Id_Rol)
             VALUES (?, ?, ?, ?, 3)`,
            [nombre_paciente, telefono_paciente, contrasenaPhantom, `${pseudoCURP}@paciente.local`]
        );
        const idUsuarioNum = resUser.insertId;

        // 2. Buscar Id numérico del Alumno que hace el registro
        const [aRows] = await connection.query('SELECT Id_Usuario FROM alumnos WHERE Matricula = ?', [matricula_alumno]);
        const idEstudianteNum = aRows.length > 0 ? aRows[0].Id_Usuario : null;

        // 3. Crear el Paciente
        const [resPaciente] = await connection.query(
            `INSERT INTO paciente (Id_Usuario, CURP, FechaNacimiento, Sexo, Ocupacion, TelefonoEmergencia, Id_Estudiante_Registro)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [idUsuarioNum, pseudoCURP, fecha_nac_paciente || '2000-01-01', sexo_paciente, ocupacion_paciente, telefono_paciente, idEstudianteNum]
        );
        const idPaciente = resPaciente.insertId;

        // 4. Crear Historial Clínico Base
        const [resHistorial] = await connection.query(
            `INSERT INTO historial_clinico (
                Id_Paciente, MedicoCabecera, HigieneOralBase
             ) VALUES (?, ?, ?)`,
            [
                idPaciente, 
                medico_cabecera || null, 
                higiene_oral
            ]
        );

        // 5. Buscar el Maestro asignado al Alumno
        const [maestroRows] = await connection.query(
            "SELECT Id_Maestro FROM alumnos WHERE Id_Usuario = ?",
            [idEstudianteNum]
        );
        const docente_asesor_num = (maestroRows.length > 0 && maestroRows[0].Id_Maestro) 
            ? maestroRows[0].Id_Maestro 
            : idEstudianteNum; // Fallback al propio alumno

        // 6. Crear una Cita "Completada" (Ya que el informe asume que hubo consulta)
        const [resCita] = await connection.query(
            `INSERT INTO citas (Id_Paciente, Id_Clinica, Id_Estudiante, Id_Docente_Asesor, Fecha, Hora, Estado)
             VALUES (?, 1, ?, ?, CURDATE(), CURTIME(), 'Completa')`,
            [idPaciente, idEstudianteNum, docente_asesor_num]
        );
        const idCita = resCita.insertId;

        // 7. Crear Consulta Evolución
        const [resConsulta] = await connection.query(
            `INSERT INTO consulta_evolucion (
                Id_Cita, MotivoConsulta, FarmacologiaActual, ATM, 
                TejidosBlandos, Periodonto, HigieneOral, Odontograma, Diagnostico, PlanTratamiento
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idCita, 
                diagnostico, 
                medicamentos_actuales || null, 
                estado_atm, 
                'Normal', 
                'Normal', 
                'Buena', 
                typeof odontograma_json === 'string' ? odontograma_json : JSON.stringify(odontograma_json),
                diagnostico,
                plan_tratamiento
            ]
        );

        await connection.commit();
        return resConsulta.insertId; // Devolvemos el ID de la consulta_evolucion

    } catch (error) {
        await connection.rollback();
        console.error('Error en transaccion guardarInforme:', error);
        throw error;
    } finally {
        connection.release();
    }
};

// Consultas comunes reutilizables
const baseSelect = `
    SELECT 
        ce.*, ce.Id_Consulta AS Id_Informe, pac.*, hc.*,
        u.Nombre AS NOMBRE_ALUMNO, 
        p.Nombre AS NOMBRE_PACIENTE, 
        p.Telefono AS TELEFONO_PACIENTE, 
        al.Matricula AS MATRICULA_ALUMNO,
        c.Fecha AS FechaRegistro,
        ce.PlanTratamiento AS PlanTratamiento,
        ce.Diagnostico AS Diagnostico,
        ce.ATM AS ATM,
        ce.HigieneOral AS HigieneOral,
        ce.Odontograma AS OdontogramaJSON,
        'Normal' AS Oclusion
    FROM consulta_evolucion ce
    INNER JOIN citas c ON ce.Id_Cita = c.Id_Cita
    INNER JOIN paciente pac ON c.Id_Paciente = pac.Id_Paciente
    INNER JOIN usuarios p ON pac.Id_Usuario = p.Id_Usuario
    LEFT JOIN usuarios u ON c.Id_Estudiante = u.Id_Usuario
    LEFT JOIN alumnos al ON u.Id_Usuario = al.Id_Usuario
    LEFT JOIN historial_clinico hc ON pac.Id_Paciente = hc.Id_Paciente
`;

// Obtener todos los informes de los alumnos a cargo de un maestro
export const getInformesPorMaestro = async (matricula_maestro) => {
    // Buscar Id_Usuario numérico del maestro
    const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [matricula_maestro]);
    if (mRows.length === 0) return [];
    const id_maestro_num = mRows[0].Id_Usuario;

    const [rows] = await db.query(
        `${baseSelect} WHERE al.Id_Maestro = ? OR c.Id_Docente_Asesor = ? ORDER BY c.Fecha DESC`,
        [id_maestro_num, id_maestro_num]
    );
    return rows;
};

// Obtener un informe por su ID (ahora Id_Consulta)
export const getInformeById = async (id) => {
    const [rows] = await db.query(
        `${baseSelect} WHERE ce.Id_Consulta = ?`,
        [id]
    );
    return rows[0];
};

// Obtener informes de un alumno específico
export const getInformesPorAlumno = async (matricula_alumno) => {
    const [aRows] = await db.query('SELECT Id_Usuario FROM alumnos WHERE Matricula = ?', [matricula_alumno]);
    if (aRows.length === 0) return [];
    const id_alumno_num = aRows[0].Id_Usuario;

    const [rows] = await db.query(
        `${baseSelect} WHERE c.Id_Estudiante = ? ORDER BY c.Fecha DESC`,
        [id_alumno_num]
    );
    return rows;
};

export const marcarInformeRevisado = async (id) => {
    return Promise.resolve();
};

// Buscar pacientes por nombre o teléfono
export const buscarInformesPorPaciente = async (valor) => {
    const query = `${baseSelect} WHERE p.Nombre LIKE ? OR p.Telefono = ? ORDER BY c.Fecha DESC`;
    const [rows] = await db.query(query, [`%${valor}%`, valor]);
    return rows;
};
