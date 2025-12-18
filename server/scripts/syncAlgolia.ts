import { query } from '../db';
import { algoliaService } from '../services/algolia';
import { Item } from '../../types';

// Simple delay helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function syncAll() {
    console.log('🔄 Starting full sync to Algolia...');

    try {
        const { rows } = await query('SELECT * FROM "Item"');
        console.log(`📊 Found ${rows.length} items in Postres.`);

        if (rows.length === 0) {
            console.log('⚠️ No items to sync.');
            process.exit(0);
        }

        const items: Item[] = rows.map(row => ({
            ...row,
            coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates
        }));

        await algoliaService.syncAllItems(items);

        console.log('✅ Sync process completed successfully.');
        // Give a moment for logs to flush
        await sleep(2000);
        process.exit(0);

    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncAll();
