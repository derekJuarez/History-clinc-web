import db from './config/db.js';

async function checkMaestro() {
    try {
        const [usuarios] = await db.query("SELECT * FROM usuarios WHERE Id_Rol = 1");
        console.log("Maestros:", usuarios);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
checkMaestro();
