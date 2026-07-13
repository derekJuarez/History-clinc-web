import db from '../backend/config/db.js';

async function check() {
    try {
        const [rows] = await db.query('SELECT ID_Matricula, Contraseña FROM usuarios WHERE ID_Matricula = ?', ['2122667f']);
        console.log('\n====================================');
        console.log('TU CONTRASEÑA EN LA BASE DE DATOS ES:', rows[0] ? rows[0].Contraseña : 'USUARIO NO ENCONTRADO');
        console.log('====================================\n');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
