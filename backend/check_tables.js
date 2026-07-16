import db from './config/db.js';

async function check() {
    const tables = ['alumnos', 'maestros', 'administradores', 'paciente'];
    for (const t of tables) {
        try {
            const [cols] = await db.query(`DESCRIBE ${t}`);
            console.log(`\nTable ${t}:`);
            console.log(cols.map(c => `${c.Field} (${c.Type}) - NULL: ${c.Null}`).join('\n'));
        } catch(e) {
            console.log(`Table ${t} does not exist.`);
        }
    }
    process.exit();
}
check();
