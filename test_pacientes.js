import db from './config/db.js';

async function checkPacientes() {
    const [pacientes] = await db.query("SELECT * FROM paciente");
    console.log("Pacientes:", pacientes);
    
    const [citas] = await db.query("SELECT * FROM citas");
    console.log("Citas:", citas);

    process.exit();
}
checkPacientes();
