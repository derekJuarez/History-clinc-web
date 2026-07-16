import db from '../config/db.js';

export async function registrarCita(citaData) {
    const { fecha, hora, motivo, estatus, id_paciente, id_docente, id_estudiante, id_clinica, radiografia, nota } = citaData;
    try {
        // id_docente y id_estudiante vienen como matrículas (strings). Hay que pasarlos a Id_Usuario (numérico)
        const [mRows] = await db.query('SELECT Id_Usuario FROM maestros WHERE Matricula = ?', [id_docente]);
        const id_docente_num = mRows.length > 0 ? mRows[0].Id_Usuario : null;

        const [aRows] = await db.query('SELECT Id_Usuario FROM alumnos WHERE Matricula = ?', [id_estudiante]);
        const id_estudiante_num = aRows.length > 0 ? aRows[0].Id_Usuario : null;

        const [result] = await db.query(
            `INSERT INTO citas(Fecha, Hora, Estado, Id_Paciente, Id_Clinica, Id_Estudiante, Id_Docente_Asesor, Motivo, Radio_Bucales, Nota) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fecha, hora, estatus || 'Pendiente', id_paciente, id_clinica, id_estudiante_num, id_docente_num, motivo, radiografia, nota]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error al registrar cita:', error);
        throw error;
    }
}


export async function obtenerCitas() {
    try {
        const [ rows ] = await db.query( `
            SELECT c.*, u.Nombre AS Nombre_Paciente From citas c
            INNER JOIN paciente p ON c.Id_Paciente = p.Id_Paciente
            INNER JOIN usuarios u ON p.Id_Usuario = u.Id_Usuario
            `);
        return rows;
    } catch (error) {
        console.error('Error al obtener citas:', error);
        throw error;
    }
}

export async function obtenerCitasPorPaciente(id_paciente) {
    try {
        // id_paciente aquí viene como el ID_MATRICULA o el Id_Paciente? En el viejo código usaba u_pac.ID_MATRICULA = ?
        // Así que asumo que id_paciente es la CURP
        const [rows] = await db.query(`
            SELECT 
                c.*, 
                u_pac.Nombre AS Nombre_Paciente,
                u_est.Nombre AS Nombre_Estudiante,
                u_est.Telefono AS Telefono_Estudiante,
                u_doc.Nombre AS Nombre_Docente,
                u_doc.Telefono AS Telefono_Docente, 
                cli.Nombre AS Nombre_Clinica,
                cli.Ubicacion AS Ubicacion_Clinica
            FROM citas c
            INNER JOIN paciente p ON c.Id_Paciente = p.Id_Paciente
            INNER JOIN usuarios u_pac ON p.Id_Usuario = u_pac.Id_Usuario
            LEFT JOIN usuarios u_est ON c.Id_Estudiante = u_est.Id_Usuario
            LEFT JOIN usuarios u_doc ON c.Id_Docente_Asesor = u_doc.Id_Usuario
            LEFT JOIN clinicas cli ON c.Id_Clinica = cli.ID_CLINICA
            WHERE p.CURP = ?
        `, [id_paciente]);
        return rows;
    } catch (error) {
        console.error('Error al obtener citas por paciente:', error);
        throw error;
    }
}

export async function modificarCita(Id_cita, nuevosDatos) {
    const {fecha,hora,estatus} = nuevosDatos;
    try {
        const [result] = await db.query(
            `UPDATE citas SET Fecha = ?, Hora = ?, Estado = ? WHERE Id_Cita = ?`,
            [fecha, hora, estatus, Id_cita]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al modificar cita:', error);
        throw error;
    }
}

export async function verificarChoqueDeHorario(fecha, hora) {
    try {
        const [rows] = await db.query(
            `SELECT * FROM citas WHERE Fecha = ? AND Hora = ? AND Estado != 'Cancelada'`,
            [fecha, hora]
        );
        return rows.length > 0;
    } catch (error) {
        console.error('Error al verificar choque de horario:', error);
        throw error;
    }
}