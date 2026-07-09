import db from '../config/db.js';

// Guardar un informe clínico enviado por un alumno
export const guardarInforme = async ({
    matricula_alumno, nombre_alumno,
    nombre_paciente, telefono_paciente, fecha_nac_paciente, sexo_paciente, ocupacion_paciente,
    alergias, medicamentos_actuales, diabetes, hipertension, problemas_cardiacos, embarazo, otros_padecimientos,
    higiene_oral, habitos, oclusion, estado_atm, diagnostico, plan_tratamiento, odontograma_json
}) => {
    const [result] = await db.query(
        `INSERT INTO informes_clinicos 
        (MATRICULA_ALUMNO, NOMBRE_ALUMNO, NOMBRE_PACIENTE, TELEFONO_PACIENTE, FECHA_NAC_PACIENTE,
         SEXO_PACIENTE, OCUPACION_PACIENTE, ALERGIAS, MEDICAMENTOS_ACTUALES, DIABETES,
         HIPERTENSION, PROBLEMAS_CARDIACOS, EMBARAZO, OTROS_PADECIMIENTOS,
         HIGIENE_ORAL, HABITOS, OCLUSION, ESTADO_ATM, DIAGNOSTICO, PLAN_TRATAMIENTO, ODONTOGRAMA_JSON)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
            matricula_alumno, nombre_alumno,
            nombre_paciente, telefono_paciente, fecha_nac_paciente || null, sexo_paciente, ocupacion_paciente,
            alergias, medicamentos_actuales, diabetes, hipertension, problemas_cardiacos, embarazo, otros_padecimientos,
            higiene_oral, habitos, oclusion, estado_atm, diagnostico, plan_tratamiento,
            typeof odontograma_json === 'string' ? odontograma_json : JSON.stringify(odontograma_json)
        ]
    );
    return result.insertId;
};

// Obtener todos los informes de los alumnos a cargo de un maestro
export const getInformesPorMaestro = async (matricula_maestro) => {
    const [rows] = await db.query(
        `SELECT i.*
         FROM informes_clinicos i
         INNER JOIN usuarios u ON u.ID_MATRICULA = i.MATRICULA_ALUMNO AND u.Id_Rol = 2
         WHERE u.ID_MAESTRO = ?
         ORDER BY i.FECHA_REGISTRO DESC`,
        [matricula_maestro]
    );
    return rows;
};

// Obtener un informe por su ID
export const getInformeById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM informes_clinicos WHERE ID_INFORME = ?',
        [id]
    );
    return rows[0];
};

// Obtener informes de un alumno específico
export const getInformesPorAlumno = async (matricula_alumno) => {
    const [rows] = await db.query(
        'SELECT * FROM informes_clinicos WHERE MATRICULA_ALUMNO = ? ORDER BY FECHA_REGISTRO DESC',
        [matricula_alumno]
    );
    return rows;
};

// Marcar informe como revisado
export const marcarInformeRevisado = async (id) => {
    await db.query(
        "UPDATE informes_clinicos SET ESTADO = 'REVISADO' WHERE ID_INFORME = ?",
        [id]
    );
};

// Buscar pacientes por nombre o teléfono en la tabla de informes_clinicos
export const buscarInformesPorPaciente = async (valor) => {
    const query = `
        SELECT * FROM informes_clinicos 
        WHERE NOMBRE_PACIENTE LIKE ? OR TELEFONO_PACIENTE = ? 
        ORDER BY FECHA_REGISTRO DESC
    `;
    const [rows] = await db.query(query, [`%${valor}%`, valor]);
    return rows;
};
