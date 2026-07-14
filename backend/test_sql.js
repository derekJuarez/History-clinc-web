import db from './config/db.js';

async function testQuery() {
    const [rows] = await db.query(`
        SELECT ce.ID_Consulta, ce.Id_Cita, ce.Motivo_Consulta, c.Id_Estudiante, u.NAME AS NOMBRE_ALUMNO, p.NAME AS NOMBRE_PACIENTE 
        FROM consultas_evolucion ce
        INNER JOIN citas c ON ce.Id_Cita = c.Id_Cita
        INNER JOIN paciente pac ON c.Id_Paciente = pac.Id_Paciente
        INNER JOIN usuarios p ON pac.Id_Usuario = p.ID_MATRICULA
        LEFT JOIN usuarios u ON c.Id_Estudiante = u.ID_MATRICULA
    `);
    console.log(rows);
    process.exit();
}
testQuery();
