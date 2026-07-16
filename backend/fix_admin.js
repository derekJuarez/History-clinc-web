import db from './config/db.js';

async function fix() {
    try {
        await db.query("UPDATE usuarios SET ID_MATRICULA = 'ADM-000001' WHERE Id_Usuario = 3");
        console.log("Admin ID_MATRICULA fixed");
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
fix();
