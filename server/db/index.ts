import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
