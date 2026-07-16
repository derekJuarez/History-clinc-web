import db from './config/db.js';
import bcrypt from 'bcryptjs';

async function migrate() {
    try {
        const [users] = await db.query('SELECT * FROM usuarios');
        console.log(`Found ${users.length} users to migrate.`);
        for (const user of users) {
            const currentPass = user.Contrasena || user.Contraseña || user.CONTRASEÑA;
            
            // Skip if it looks like a bcrypt hash (starts with $2a$ or $2b$)
            if (currentPass && !currentPass.startsWith('$2')) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(currentPass, salt);
                
                await db.query(
                    'UPDATE usuarios SET Contrasena = ? WHERE Id_Usuario = ?',
                    [hash, user.Id_Usuario]
                );
                console.log(`Migrated user ID: ${user.Id_Usuario} (${user.ID_MATRICULA})`);
            } else {
                console.log(`Skipped user ID: ${user.Id_Usuario} (already hashed or null)`);
            }
        }
        console.log("Migration complete.");
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
migrate();
