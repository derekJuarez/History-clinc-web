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