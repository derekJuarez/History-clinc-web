import db from './config/db.js';

async function checkDB() {
    try {
        const [tables] = await db.query("SHOW TABLES");
        console.log("Tablas:", tables);

        const [informes] = await db.query("SELECT * FROM consultas_evolucion");
        console.log("consultas_evolucion:", informes);
        
        try {
            const [oldInformes] = await db.query("SELECT * FROM informes_clinicos");
            console.log("informes_clinicos:", oldInformes);
        } catch(e) {
            console.log("No existe informes_clinicos");
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
checkDB();
