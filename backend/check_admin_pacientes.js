import db from './config/db.js';

async function check() {
    try {
        const [admins] = await db.query('SELECT * FROM administradores');
        console.log('Administradores en la tabla:');
        console.log(admins);

        const [pacientes] = await db.query('SELECT * FROM paciente');
        console.log('\nPacientes en la tabla:');
        console.log(pacientes);
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
check();
