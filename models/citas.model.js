import db from '../config/db.js';

export async function registrarCita(citaData) {
    const { fecha, hora, motivo, estatus, id_paciente, id_docente, id_estudiante, id_clinica } = citaData;
    try {
        const [result] = await db.query(
            `INSERT INTO citas(Fecha, Hora, Estatus, Id_Paciente, Id_Clinica, Id_Estudiante, Id_Docente_Asesor, Motivo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [fecha, hora, estatus, id_paciente, id_clinica, id_estudiante, id_docente, motivo]
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