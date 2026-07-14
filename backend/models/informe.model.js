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
        const pseudoMatricula = `PAC-${Date.now()}`;
        const contrasenaPhantom = 'paciente123'; // O generar un hash si usaran bcrypt
        await connection.query(
            `INSERT INTO usuarios (ID_MATRICULA, NAME, TELEFONO, CONTRASEÑA, CORREO, Id_Rol)
             VALUES (?, ?, ?, ?, ?, 4)`,
            [pseudoMatricula, nombre_paciente, telefono_paciente, contrasenaPhantom, `${pseudoMatricula}@paciente.local`]
        );

        // 2. Crear el Paciente
        const [resPaciente] = await connection.query(
            `INSERT INTO paciente (Id_Usuario, Fecha_Nacimiento, Sexo, Ocupacion, Telefono_Emergencia)
             VALUES (?, ?, ?, ?, ?)`,
            [pseudoMatricula, fecha_nac_paciente || '2000-01-01', sexo_paciente, ocupacion_paciente, telefono_paciente]
        );
        const idPaciente = resPaciente.insertId;

        // 3. Crear Historial Clínico Base
        const [resHistorial] = await connection.query(
            `INSERT INTO historial_clinico (
                Id_Paciente, Medico_Cabecera, Higiene_Oral_Base, 
                Tabaquismo, Alcoholismo, Drogadiccion, 
                Cardiovascular_Data, Endocrino_Data, Hematologico_Data, 
                Infectocontagiosas_Data, Alergias_Flags
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idPaciente, 
                medico_cabecera || null, 
                higiene_oral, 
                tabaquismo || 'No', 
                alcoholismo || 'No', 
                drogadiccion || 'No', 
                cardiovascular_data || null, 
                endocrino_data || null, 
                hematologico_data || null, 
                infectocontagiosas_data || null, 
                alergias_flags || null
            ]
        );

        // 3.5 Buscar el Maestro asignado al Alumno
        const [maestroRows] = await connection.query(
            "SELECT ID_MAESTRO FROM usuarios WHERE ID_MATRICULA = ?",
            [matricula_alumno]
        );
        const docente_asesor = (maestroRows.length > 0 && maestroRows[0].ID_MAESTRO) 
            ? maestroRows[0].ID_MAESTRO 
            : matricula_alumno;

        // 4. Crear una Cita "Completada" (Ya que el informe asume que hubo consulta)
        const [resCita] = await connection.query(
            `INSERT INTO citas (Id_Paciente, Id_Ubicacion, Id_Estudiante, Id_Docente_Asesor, Fecha, Hora, Estatus)
             VALUES (?, 1, ?, ?, CURDATE(), CURTIME(), 'Completa')`,
            [idPaciente, matricula_alumno, docente_asesor]
        );
        const idCita = resCita.insertId;

        // 5. Crear Consulta Evolución (que ahora funciona como informe clínico)
        const [resConsulta] = await connection.query(
            `INSERT INTO consultas_evolucion (
                Id_Cita, Motivo_Consulta, Farmacologia_Actual, Atm_Exploracion, 
                Tejidos_Blandos, Periodonto, Higiene_Oral_Actual, Odontograma_JSON, Diagnostico_Plan_Tratamiento
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idCita, 
                diagnostico, 
                medicamentos_actuales || null, 
                estado_atm, 
                'Normal', 
                'Normal', 
                'Buena', 
                typeof odontograma_json === 'string' ? odontograma_json : JSON.stringify(odontograma_json),
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
        ce.*, ce.ID_Consulta AS Id_Informe, pac.*, hc.*,
        u.NAME AS NOMBRE_ALUMNO, 
        p.NAME AS NOMBRE_PACIENTE, 
        p.TELEFONO AS TELEFONO_PACIENTE, 
        c.Id_Estudiante AS MATRICULA_ALUMNO,
        c.Fecha AS FechaRegistro,
        ce.Diagnostico_Plan_Tratamiento AS PlanTratamiento,
        ce.Motivo_Consulta AS Diagnostico,
        ce.Atm_Exploracion AS ATM,
        ce.Higiene_Oral_Actual AS HigieneOral,
        ce.Odontograma_JSON AS OdontogramaJSON,
        'Normal' AS Oclusion
    FROM consultas_evolucion ce
    INNER JOIN citas c ON ce.Id_Cita = c.Id_Cita
    INNER JOIN paciente pac ON c.Id_Paciente = pac.Id_Paciente
    INNER JOIN usuarios p ON pac.Id_Usuario = p.ID_MATRICULA
    LEFT JOIN usuarios u ON c.Id_Estudiante = u.ID_MATRICULA
    LEFT JOIN historial_clinico hc ON pac.Id_Paciente = hc.Id_Paciente
`;

// Obtener todos los informes de los alumnos a cargo de un maestro
export const getInformesPorMaestro = async (matricula_maestro) => {
    const [rows] = await db.query(
        `${baseSelect} WHERE u.ID_MAESTRO = ? OR c.Id_Docente_Asesor = ? ORDER BY c.Fecha DESC`,
        [matricula_maestro, matricula_maestro]
    );
    return rows;
};

// Obtener un informe por su ID (ahora ID_Consulta)
export const getInformeById = async (id) => {
    const [rows] = await db.query(
        `${baseSelect} WHERE ce.ID_Consulta = ?`,
        [id]
    );
    return rows[0];
};

// Obtener informes de un alumno específico
export const getInformesPorAlumno = async (matricula_alumno) => {
    const [rows] = await db.query(
        `${baseSelect} WHERE c.Id_Estudiante = ? ORDER BY c.Fecha DESC`,
        [matricula_alumno]
    );
    return rows;
};

// Marcar informe como revisado (Ya no existe columna Estado en informes_clinicos, no-op o marcar cita como completa)
export const marcarInformeRevisado = async (id) => {
    // Si la tabla informes_clinicos ya no existe, podemos actualizar la cita o simplemente no hacer nada.
    // Como Estatus en Citas ya es 'Completa', lo dejamos vacío.
    return Promise.resolve();
};

// Buscar pacientes por nombre o teléfono
export const buscarInformesPorPaciente = async (valor) => {
    const query = `${baseSelect} WHERE p.NAME LIKE ? OR p.TELEFONO = ? ORDER BY c.Fecha DESC`;
    const [rows] = await db.query(query, [`%${valor}%`, valor]);
    return rows;
};
