import db from './config/db.js';

async function checkUser() {
    const [user] = await db.query("SELECT NAME FROM usuarios WHERE ID_MATRICULA = '2122667f'");
    console.log(user);
    process.exit();
}
checkUser();
