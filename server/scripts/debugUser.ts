import { query } from '../db';

async function checkUser() {
    try {
        const email = '73939763@continental.edu.pe'; // From the screenshot
        console.log(`🔍 Buscando usuario: ${email}`);

        const res = await query('SELECT * FROM "User" WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            console.log("❌ Usuario no encontrado.");
        } else {
            console.log("✅ Usuario encontrado:");
            console.table(res.rows[0]);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkUser();
