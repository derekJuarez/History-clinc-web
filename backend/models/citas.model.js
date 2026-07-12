import db from '../config/db.js';

export async function registrarCita(citaData) {
    const { fecha, hora, motivo, estatus, id_paciente, id_docente, id_estudiante, id_clinica, radiografia, nota } = citaData;
    try {
        const [result] = await db.query(
            `INSERT INTO citas(Fecha, Hora, Estatus, Id_Paciente, Id_Clinica, Id_Estudiante, Id_Docente_Asesor, Motivo, Radio_Bucales, Nota) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fecha, hora, estatus, id_paciente, id_clinica, id_estudiante, id_docente, motivo, radiografia, nota]
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
            SELECT c.*, u.Name AS Nombre_Paciente From citas c
            INNER JOIN paciente p ON c.Id_Paciente = p.Id_Paciente
            INNER JOIN usuarios u ON p.Id_Usuario = u.Id_Matricula
            `);
        return rows;
    } catch (error) {
        console.error('Error al obtener citas:', error);
        throw error;
    }
}

export async function modificarCita(Id_cita, nuevosDatos) {
    const {fecha,hora,estatus} = nuevosDatos;
    try {
        const [result] = await db.query(
            `UPDATE citas SET Fecha = ?, Hora = ?, Estatus = ? WHERE Id_Cita = ?`,
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
            `SELECT * FROM citas WHERE Fecha = ? AND Hora = ? AND Estatus != 'Cancelada'`,
            [fecha, hora,]
        );
        return rows.length > 0; // Retorna true si hay un choque de horario
    } catch (error) {
        console.error('Error al verificar choque de horario:', error);
        throw error;
    }
}