import db from '../config/db.js';

export async function registrarCita(citaData) {
    const { id_paciente, id_doctor, fecha_hora, motivo, ubicacion,Estatus } = citaData;
    try {
        const [result] = await db.query(
            'INSERT INTO citas (Id_Paciente, Id_Doctor, Fecha_Hora, Motivo, Ubicacion, Estatus) VALUES (?, ?, ?, ?, ?, ?)',
            [id_paciente, id_doctor, fecha_hora, motivo, ubicacion, Estatus]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error al registrar cita:', error);
        throw error;
    }
}