import { getInformesPorMaestro } from './models/informe.model.js';

async function test() {
    try {
        const rows = await getInformesPorMaestro('UMS98234');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error("Error SQL:", err);
    }
}

test();
