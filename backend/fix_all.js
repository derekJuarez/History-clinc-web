import db from './config/db.js';

async function fix() {
    try {
        await db.query("UPDATE usuarios SET ID_MATRICULA = 'UMS98234' WHERE Id_Usuario = 1");
        await db.query("UPDATE usuarios SET ID_MATRICULA = '2025785t' WHERE Id_Usuario = 2");
        await db.query("UPDATE usuarios SET ID_MATRICULA = 'PAC-000001' WHERE Id_Usuario = 4");
        await db.query("UPDATE usuarios SET ID_MATRICULA = 'PAC-000002' WHERE Id_Usuario = 5");
        console.log("All missing ID_MATRICULA fixed");
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
fix();
