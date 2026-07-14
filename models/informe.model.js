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
    alergias,
    medicamentos_actuales,
    diabetes,
    hipertension,
    problemas_cardiacos,
    embarazo,
    otros_padecimientos,
    higiene_oral,
    habitos,
    oclusion,
    estado_atm,
    diagnostico,
    plan_tratamiento,
    odontograma_json
}) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Crear un Usuario Fantasma para el Paciente
        const pseudoMatricula = `PAC-${Date.now()}`;
        const contrasenaPhantom = 'paciente123'; // O generar un hash si usaran bcrypt
        await connection.query(
            `INSERT INTO usuarios (ID_MATRICULA, Nombre, Telefono, Contrasena, Correo, Id_Rol)
             VALUES (?, ?, ?, ?, ?, 4)`,
            [pseudoMatricula, nombre_paciente, telefono_paciente, contrasenaPhantom, `${pseudoMatricula}@paciente.local`]
        );

        // 2. Crear el Paciente
        const [resPaciente] = await connection.query(
            `INSERT INTO paciente (Id_Usuario, FechaNacimiento, Sexo, Ocupacion, TelefonoEmergencia)
             VALUES (?, ?, ?, ?, ?)`,
            [pseudoMatricula, fecha_nac_paciente || '2000-01-01', sexo_paciente, ocupacion_paciente, telefono_paciente]
        );
        const idPaciente = resPaciente.insertId;

        // 3. Crear Historial Clínico Base
        const [resHistorial] = await connection.query(
            `INSERT INTO historial_clinico (Id_Paciente, HigieneOralBase) VALUES (?, ?)`,
            [idPaciente, higiene_oral]
        );

        // 4. Guardar Alergias
        if (alergias) {
            await connection.query(
                `INSERT INTO alergias_paciente (Id_Paciente, Alergia) VALUES (?, ?)`,
                [idPaciente, alergias]
            );
        }

        // 5. Guardar Hábitos
        if (habitos) {
            await connection.query(
                `INSERT INTO habitos_paciente (Id_Paciente, Habito) VALUES (?, ?)`,
                [idPaciente, habitos]
            );
        }

        // 6. Guardar Antecedentes (uno por cada flag si es 'Sí')
        const addAntecedente = async (cat, det) => {
            if (det && det !== 'No') {
                await connection.query(
                    `INSERT INTO antecedentes_paciente (Id_Paciente, Categoria, Detalle) VALUES (?, ?, ?)`,
                    [idPaciente, cat, det]
                );
            }
        };
        await addAntecedente('Medicamentos', medicamentos_actuales);
        await addAntecedente('Diabetes', diabetes);
        await addAntecedente('Hipertension', hipertension);
        await addAntecedente('Problemas Cardiacos', problemas_cardiacos);
        await addAntecedente('Embarazo', embarazo);
        await addAntecedente('Otros', otros_padecimientos);

        // 7. Crear una Cita "Completada" (Ya que el informe asume que hubo consulta)
        const [resCita] = await connection.query(
            `INSERT INTO citas (Id_Paciente, Id_Clinica, Id_Estudiante, Id_Docente_Asesor, Fecha, Hora, Estado)
             VALUES (?, 1, ?, COALESCE((SELECT Id_Maestro FROM usuarios WHERE ID_MATRICULA = ?), ?), CURDATE(), CURTIME(), 'Completa')`,
            [idPaciente, matricula_alumno, matricula_alumno, matricula_alumno]
        );
        const idCita = resCita.insertId;

        // 8. Crear Consulta Evolución
        const [resConsulta] = await connection.query(
            `INSERT INTO consulta_evolucion (Id_Cita, ATM, TejidosBlandos, Periodonto, HigieneOral, Diagnostico, PlanTratamiento)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [idCita, estado_atm, 'Normal', 'Normal', higiene_oral, diagnostico, plan_tratamiento]
        );
        const idConsulta = resConsulta.insertId;

        // 9. Crear el Informe Clínico final
        const [resultInforme] = await connection.query(
            `INSERT INTO informes_clinicos (Id_Consulta, Estado, OdontogramaJSON)
             VALUES (?, 'PENDIENTE', ?)`,
            [idConsulta, typeof odontograma_json === 'string' ? odontograma_json : JSON.stringify(odontograma_json)]
        );

        await connection.commit();
        return resultInforme.insertId;

    } catch (error) {
        await connection.rollback();
        console.error('Error en transaccion guardarInforme:', error);
        throw error;
    } finally {
        connection.release();
    }
};

// Obtener todos los informes de los alumnos a cargo de un maestro
export const getInformesPorMaestro = async (matricula_maestro) => {
    const [rows] = await db.query(
        `SELECT 
            i.*, ce.*, pac.*, 
            u.Nombre AS NOMBRE_ALUMNO, 
            p.Nombre AS NOMBRE_PACIENTE, 
            p.Telefono AS TELEFONO_PACIENTE, 
            c.Id_Estudiante AS MATRICULA_ALUMNO,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Diabetes' LIMIT 1) AS Diabetes,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Hipertension' LIMIT 1) AS Hipertension,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Problemas Cardiacos' LIMIT 1) AS ProblemasCardiacos,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Embarazo' LIMIT 1) AS Embarazo,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Otros' LIMIT 1) AS Otros,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Medicamentos' LIMIT 1) AS Medicamentos,
            (SELECT GROUP_CONCAT(Alergia SEPARATOR ', ') FROM alergias_paciente WHERE Id_Paciente = pac.Id_Paciente) AS Alergias,
            (SELECT GROUP_CONCAT(Habito SEPARATOR ', ') FROM habitos_paciente WHERE Id_Paciente = pac.Id_Paciente) AS Habitos,
            'Normal' AS Oclusion
         FROM informes_clinicos i
         INNER JOIN consulta_evolucion ce ON i.Id_Consulta = ce.Id_Consulta
         INNER JOIN citas c ON ce.Id_Cita = c.Id_Cita
         INNER JOIN paciente pac ON c.Id_Paciente = pac.Id_Paciente
         INNER JOIN usuarios p ON pac.Id_Usuario = p.ID_MATRICULA
         INNER JOIN usuarios u ON c.Id_Estudiante = u.ID_MATRICULA
         WHERE u.Id_Maestro = ?
         ORDER BY i.FechaRegistro DESC`,
        [matricula_maestro]
    );
    return rows;
};

// Obtener un informe por su ID
export const getInformeById = async (id) => {
    const [rows] = await db.query(
        `SELECT 
            i.*, ce.*, pac.*, 
            u.Nombre AS NOMBRE_ALUMNO, 
            p.Nombre AS NOMBRE_PACIENTE, 
            p.Telefono AS TELEFONO_PACIENTE, 
            c.Id_Estudiante AS MATRICULA_ALUMNO,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Diabetes' LIMIT 1) AS Diabetes,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Hipertension' LIMIT 1) AS Hipertension,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Problemas Cardiacos' LIMIT 1) AS ProblemasCardiacos,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Embarazo' LIMIT 1) AS Embarazo,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Otros' LIMIT 1) AS Otros,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Medicamentos' LIMIT 1) AS Medicamentos,
            (SELECT GROUP_CONCAT(Alergia SEPARATOR ', ') FROM alergias_paciente WHERE Id_Paciente = pac.Id_Paciente) AS Alergias,
            (SELECT GROUP_CONCAT(Habito SEPARATOR ', ') FROM habitos_paciente WHERE Id_Paciente = pac.Id_Paciente) AS Habitos,
            'Normal' AS Oclusion
         FROM informes_clinicos i
         INNER JOIN consulta_evolucion ce ON i.Id_Consulta = ce.Id_Consulta
         INNER JOIN citas c ON ce.Id_Cita = c.Id_Cita
         INNER JOIN paciente pac ON c.Id_Paciente = pac.Id_Paciente
         INNER JOIN usuarios p ON pac.Id_Usuario = p.ID_MATRICULA
         LEFT JOIN usuarios u ON c.Id_Estudiante = u.ID_MATRICULA
         WHERE i.Id_Informe = ?`,
        [id]
    );
    return rows[0];
};

// Obtener informes de un alumno específico
export const getInformesPorAlumno = async (matricula_alumno) => {
    const [rows] = await db.query(
        `SELECT 
            i.*, ce.*, pac.*, 
            u.Nombre AS NOMBRE_ALUMNO, 
            p.Nombre AS NOMBRE_PACIENTE, 
            p.Telefono AS TELEFONO_PACIENTE, 
            c.Id_Estudiante AS MATRICULA_ALUMNO,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Diabetes' LIMIT 1) AS Diabetes,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Hipertension' LIMIT 1) AS Hipertension,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Problemas Cardiacos' LIMIT 1) AS ProblemasCardiacos,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Embarazo' LIMIT 1) AS Embarazo,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Otros' LIMIT 1) AS Otros,
            (SELECT Detalle FROM antecedentes_paciente WHERE Id_Paciente = pac.Id_Paciente AND Categoria = 'Medicamentos' LIMIT 1) AS Medicamentos,
            (SELECT GROUP_CONCAT(Alergia SEPARATOR ', ') FROM alergias_paciente WHERE Id_Paciente = pac.Id_Paciente) AS Alergias,
            (SELECT GROUP_CONCAT(Habito SEPARATOR ', ') FROM habitos_paciente WHERE Id_Paciente = pac.Id_Paciente) AS Habitos,
            'Normal' AS Oclusion
         FROM informes_clinicos i
         INNER JOIN consulta_evolucion ce ON i.Id_Consulta = ce.Id_Consulta
         INNER JOIN citas c ON ce.Id_Cita = c.Id_Cita
         INNER JOIN paciente pac ON c.Id_Paciente = pac.Id_Paciente
         INNER JOIN usuarios p ON pac.Id_Usuario = p.ID_MATRICULA
         LEFT JOIN usuarios u ON c.Id_Estudiante = u.ID_MATRICULA
         WHERE c.Id_Estudiante = ?
         ORDER BY i.FechaRegistro DESC`,
        [matricula_alumno]
    );
    return rows;
};

// Marcar informe como revisado
export const marcarInformeRevisado = async (id) => {
    await db.query(
        "UPDATE informes_clinicos SET Estado = 'REVISADO' WHERE Id_Informe = ?",
        [id]
    );
};

// Buscar pacientes por nombre o teléfono en la tabla de informes_clinicos
export const buscarInformesPorPaciente = async (valor) => {
    const query = `
        SELECT i.*, ce.*, pac.*, p.Nombre AS NOMBRE_PACIENTE, p.Telefono AS TELEFONO_PACIENTE
        FROM informes_clinicos i
        INNER JOIN consulta_evolucion ce ON i.Id_Consulta = ce.Id_Consulta
        INNER JOIN citas c ON ce.Id_Cita = c.Id_Cita
        INNER JOIN paciente pac ON c.Id_Paciente = pac.Id_Paciente
        INNER JOIN usuarios p ON pac.Id_Usuario = p.ID_MATRICULA
        WHERE p.Nombre LIKE ? OR p.Telefono = ? 
        ORDER BY i.FechaRegistro DESC
    `;
    const [rows] = await db.query(query, [`%${valor}%`, valor]);
    return rows;
};
