import { query } from '../db';

async function check() {
    try {
        console.log('🔍 Checking User table schema...');
        const res = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `);

        console.log('Columns found:', res.rows.map(r => r.column_name));

        const hasStatus = res.rows.some(r => r.column_name === 'status');
        console.log('Has Status Column:', hasStatus);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
