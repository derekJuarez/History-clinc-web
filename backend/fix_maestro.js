import db from './config/db.js';

async function fix() {
    try {
        await db.query(`UPDATE maestros SET Matricula = 'UMS98234' WHERE Id_Usuario = 1`);
        console.log('Maestro arreglado exitosamente');
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
fix();
