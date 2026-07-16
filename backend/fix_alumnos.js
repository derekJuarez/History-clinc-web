import db from './config/db.js';

async function fix() {
    try {
        await db.query(`INSERT IGNORE INTO alumnos (Id_Usuario, Matricula, Id_Maestro) VALUES (6, '2122667f', NULL), (7, '2122678g', 1)`);
        console.log('Alumnos arreglados exitosamente');
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
fix();
