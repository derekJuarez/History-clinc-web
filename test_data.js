import db from './config/db.js';

async function testQuery() {
    const [citas] = await db.query("SELECT * FROM citas");
    console.log("CITAS:", citas);

    const [usuarios] = await db.query("SELECT ID_MATRICULA, NAME, ID_MAESTRO FROM usuarios WHERE ID_MATRICULA IN ('2025785t', 'ALU-123')");
    console.log("USUARIOS ESTUDIANTES:", usuarios);
    
    process.exit();
}
testQuery();
