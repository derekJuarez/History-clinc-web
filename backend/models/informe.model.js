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
        const contrasenaPhantom = 'paciente123';
        await connection.query(
            `INSERT INTO usuarios (ID_MATRICULA, Nombre, Telefono, Contrasena, Correo, Id_Rol)
             VALUES (?, ?, ?, ?, ?, 4)`,
            [pseudoMatricula, nombre_paciente, telefono_paciente, contrasenaPhantom, `${pseudoMatricula}@paciente.local`]
        );

        // 2. Crear el Paciente
        // Columnas reales: Id_Usuario, FechaNacimiento, Sexo, EstadoCivil, Ocupacion,
        //                  LugarOrigen, TelefonoEmergencia, ContactoFamiliar, Id_Estudiante_Registro
        const [resPaciente] = await connection.query(
            `INSERT INTO paciente (Id_Usuario, FechaNacimiento, Sexo, Ocupacion, TelefonoEmergencia, Id_Estudiante_Registro)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [pseudoMatricula, fecha_nac_paciente || '2000-01-01', sexo_paciente || 'N/E', ocupacion_paciente || '', telefono_paciente || '', matricula_alumno]
        );
        const idPaciente = resPaciente.insertId;

        // 3. Crear Historial Clínico Base
        // Columnas reales: Id_Paciente, MedicoCabecera, HigieneOralBase
        const [resHistorial] = await connection.query(
            `INSERT INTO historial_clinico (Id_Paciente, MedicoCabecera, HigieneOralBase)
             VALUES (?, ?, ?)`,
            [idPaciente, medico_cabecera || null, higiene_oral || null]
        );

        // 3.5 Guardar antecedentes en tablas especializadas
        const antecedentes = [
            tabaquismo && tabaquismo !== 'No' ? ['Tabaquismo', tabaquismo] : null,
            alcoholismo && alcoholismo !== 'No' ? ['Alcoholismo', alcoholismo] : null,
            drogadiccion && drogadiccion !== 'No' ? ['Drogadiccion', drogadiccion] : null,
            cardiovascular_data ? ['Cardiovascular', cardiovascular_data] : null,
            endocrino_data ? ['Endocrino', endocrino_data] : null,
            hematologico_data ? ['Hematologico', hematologico_data] : null,
            infectocontagiosas_data ? ['Infectocontagiosas', infectocontagiosas_data] : null,
            medicamentos_actuales ? ['Medicamentos', medicamentos_actuales] : null,
            alergias_flags ? ['Alergias', alergias_flags] : null,
        ].filter(Boolean);

        for (const [categoria, detalle] of antecedentes) {
            await connection.query(
                `INSERT INTO antecedentes_paciente (Id_Paciente, Categoria, Detalle) VALUES (?, ?, ?)`,
                [idPaciente, categoria, detalle]
            );
        }

        // Guardar hábitos
        if (habitos && habitos.trim()) {
            const listaHabitos = habitos.split(',').map(h => h.trim()).filter(Boolean);
            for (const habito of listaHabitos) {
                await connection.query(
                    `INSERT INTO habitos_paciente (Id_Paciente, Habito) VALUES (?, ?)`,
                    [idPaciente, habito]
                );
            }
        }

        // 3.6 Buscar el Maestro asignado al Alumno
        const [maestroRows] = await connection.query(
            "SELECT ID_MAESTRO FROM usuarios WHERE ID_MATRICULA = ?",
            [matricula_alumno]
        );
        const docente_asesor = (maestroRows.length > 0 && maestroRows[0].ID_MAESTRO) 
            ? maestroRows[0].ID_MAESTRO 
            : matricula_alumno;

        // 4. Crear una Cita "Completada"
        // Columnas reales: Id_Paciente, Id_Clinica, Id_Estudiante, Id_Docente_Asesor, Fecha, Hora, Estado, Motivo
        const [resCita] = await connection.query(
            `INSERT INTO citas (Id_Paciente, Id_Clinica, Id_Estudiante, Id_Docente_Asesor, Fecha, Hora, Estado, Motivo)
             VALUES (?, 1, ?, ?, CURDATE(), CURTIME(), 'Completa', ?)`,
            [idPaciente, matricula_alumno, docente_asesor, diagnostico || 'Consulta inicial']
        );
        const idCita = resCita.insertId;

        // 5. Crear Consulta de Evolución
        // Tabla real: consulta_evolucion
        // Columnas: Id_Cita, MotivoConsulta, FarmacologiaActual, ATM, TejidosBlandos,
        //           Periodonto, HigieneOral, Odontograma, Diagnostico, PlanTratamiento
        const odontogramaStr = typeof odontograma_json === 'string'
            ? odontograma_json
            : JSON.stringify(odontograma_json);

        const [resConsulta] = await connection.query(
            `INSERT INTO consulta_evolucion
                (Id_Cita, MotivoConsulta, FarmacologiaActual, ATM, TejidosBlandos,
                 Periodonto, HigieneOral, Odontograma, Diagnostico, PlanTratamiento)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idCita,
                diagnostico || null,
                medicamentos_actuales || null,
                estado_atm || null,
                'Normal',
                'Normal',
                higiene_oral || null,
                odontogramaStr,
                diagnostico || null,
                plan_tratamiento || null
            ]
        );
        const idConsulta = resConsulta.insertId;

        // 6. Crear registro en informes_clinicos
        // Columnas: Id_Consulta, OdontogramaJSON
        const [resInforme] = await connection.query(
            `INSERT INTO informes_clinicos (Id_Consulta, OdontogramaJSON) VALUES (?, ?)`,
            [idConsulta, odontogramaStr]
        );

        await connection.commit();
        return resInforme.insertId;

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
        ic.Id_Informe, ic.FechaRegistro, ic.Estado AS EstadoInforme, ic.OdontogramaJSON,
        ce.Id_Consulta, ce.MotivoConsulta AS Diagnostico, ce.PlanTratamiento,
        ce.ATM, ce.HigieneOral, ce.FarmacologiaActual, ce.Odontograma,
        pac.Id_Paciente, pac.FechaNacimiento, pac.Sexo, pac.Ocupacion,
        u_pac.Nombre AS NOMBRE_PACIENTE,
        u_pac.Telefono AS TELEFONO_PACIENTE,
        u_alu.Nombre AS NOMBRE_ALUMNO,
        c.Id_Estudiante AS MATRICULA_ALUMNO,
        c.Fecha AS FechaConsulta,
        hc.MedicoCabecera, hc.HigieneOralBase
    FROM informes_clinicos ic
    INNER JOIN consulta_evolucion ce ON ic.Id_Consulta = ce.Id_Consulta
    INNER JOIN citas c ON ce.Id_Cita = c.Id_Cita
    INNER JOIN paciente pac ON c.Id_Paciente = pac.Id_Paciente
    INNER JOIN usuarios u_pac ON pac.Id_Usuario = u_pac.ID_MATRICULA
    LEFT JOIN usuarios u_alu ON c.Id_Estudiante = u_alu.ID_MATRICULA
    LEFT JOIN historial_clinico hc ON pac.Id_Paciente = hc.Id_Paciente
`;

// Obtener todos los informes de los alumnos a cargo de un maestro
export const getInformesPorMaestro = async (matricula_maestro) => {
    const [rows] = await db.query(
        `${baseSelect} WHERE u_alu.ID_MAESTRO = ? OR c.Id_Docente_Asesor = ? ORDER BY ic.FechaRegistro DESC`,
        [matricula_maestro, matricula_maestro]
    );
    return rows;
};

// Obtener un informe por su ID
export const getInformeById = async (id) => {
    const [rows] = await db.query(
        `${baseSelect} WHERE ic.Id_Informe = ?`,
        [id]
    );
    return rows[0];
};

// Obtener informes de un alumno específico
export const getInformesPorAlumno = async (matricula_alumno) => {
    const [rows] = await db.query(
        `${baseSelect} WHERE c.Id_Estudiante = ? ORDER BY ic.FechaRegistro DESC`,
        [matricula_alumno]
    );
    return rows;
};

// Marcar informe como revisado
export const marcarInformeRevisado = async (id) => {
    await db.query(
        `UPDATE informes_clinicos SET Estado = 'Revisado' WHERE Id_Informe = ?`,
        [id]
    );
};

// Buscar pacientes por nombre o teléfono
export const buscarInformesPorPaciente = async (valor) => {
    const query = `${baseSelect} WHERE u_pac.Nombre LIKE ? OR u_pac.Telefono = ? ORDER BY ic.FechaRegistro DESC`;
    const [rows] = await db.query(query, [`%${valor}%`, valor]);
    return rows;
};
