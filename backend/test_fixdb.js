import db from './config/db.js';

async function fixDB() {
    try {
        // Asignar a Mauricio como maestro de los alumnos
        await db.query("UPDATE usuarios SET ID_MAESTRO = 'UMS98234' WHERE Id_Rol = 2");
        
        // Arreglar las citas existentes para que el alumno sea Yahir o Fernando
        // y el maestro sea Mauricio
        await db.query("UPDATE citas SET Id_Estudiante = '2122667f', Id_Docente_Asesor = 'UMS98234' WHERE ID_Cita IN (5, 6, 7, 8)");
        
        console.log("DB Fixed");
        process.exit();
    } catch(e) {
        console.error(e);
        process.exit();
    }
}
fixDB();
