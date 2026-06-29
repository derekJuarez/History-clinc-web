/**
 * start-ngrok.js
 * Lanza el servidor Node.js y abre un tunel ngrok.
 * Muestra la URL publica en consola y la obtiene via API local de ngrok.
 */

import { spawn } from "child_process";

const PORT = process.env.PORT || 3001;

// 1. Iniciar el servidor Express
console.log("Iniciando servidor Express...");
const server = spawn("node", ["backend/server.js"], {
    stdio: "inherit",
    shell: false
});

server.on("error", (err) => {
    console.error("Error al iniciar el servidor:", err.message);
    process.exit(1);
});

// 2. Esperar 2 segundos y luego abrir ngrok en modo log=json
setTimeout(() => {
    console.log(`\nAbriendo tunel ngrok en el puerto ${PORT}...`);

    const ngrok = spawn("ngrok", [
        "http", String(PORT),
        "--log=stdout",
        "--log-format=json"
    ], { shell: false });

    ngrok.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        lines.forEach(line => {
            if (!line.trim()) return;
            try {
                const json = JSON.parse(line);
                // Detectar cuando el tunel esta listo
                if (json.msg === "started tunnel" && json.url) {
                    console.log("\n==========================================");
                    console.log("  TUNEL NGROK ACTIVO");
                    console.log("==========================================");
                    console.log("  URL PUBLICA: " + json.url);
                    console.log("  Comparte esta URL para acceder al proyecto");
                    console.log("==========================================\n");
                }
            } catch (e) {
                // ignorar lineas que no son JSON
            }
        });
    });

    ngrok.stderr.on("data", (data) => {
        console.error("ngrok error:", data.toString());
    });

    ngrok.on("error", (err) => {
        console.error("\nNo se pudo iniciar ngrok:", err.message);
        console.error("  Asegurate de que ngrok esta instalado: https://ngrok.com/download");
    });

    ngrok.on("close", (code) => {
        console.log(`\nngrok cerrado (codigo ${code}).`);
        server.kill();
        process.exit(code || 0);
    });

}, 2000);

// 3. Cerrar limpiamente con Ctrl+C
process.on("SIGINT", () => {
    console.log("\nCerrando servidor y ngrok...");
    server.kill();
    process.exit(0);
});
