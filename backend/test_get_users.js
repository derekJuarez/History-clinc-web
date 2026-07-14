import db from './config/db.js';

async function getUsers() {
    try {
        const [rows] = await db.query("SELECT ID_MATRICULA, Id_Rol FROM usuarios LIMIT 5");
        console.log("Usuarios en la BD:", rows);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        db.end();
    }
}

getUsers();
