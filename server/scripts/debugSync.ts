import { query } from '../db';
import algoliasearch from 'algoliasearch';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const APP_ID = process.env.ALGOLIA_APP_ID || '';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY || '';
const INDEX_NAME = process.env.VITE_ALGOLIA_INDEX_NAME || 'rental_items';

if (!APP_ID || !ADMIN_KEY) {
    console.error('Missing Algolia credentials in .env');
    process.exit(1);
}

const logFile = path.join(process.cwd(), 'sync_log.txt');
const log = (msg: string) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

// Reset log
fs.writeFileSync(logFile, '--- Sync Start ---\n');

log(`Config: ${APP_ID} / ${INDEX_NAME}`);

async function syncAll() {
    try {
        const client = algoliasearch(APP_ID, ADMIN_KEY);
        const index = client.initIndex(INDEX_NAME);

        log('Client initialized.');

        // 1. Fetch from DB
        const { rows } = await query('SELECT * FROM "Item"');
        log(`DB Fetch: Found ${rows.length} items.`);

        if (rows.length === 0) {
            log('No items to sync.');
            return;
        }

        // 2. Map
        const objects = rows.map(item => ({
            objectID: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            pricePerDay: Number(item.pricePerDay),
            imageUrl: item.imageUrl,
            location: item.location,
            _geoloc: {
                lat: typeof item.latitude === 'number' ? item.latitude : parseFloat(item.latitude),
                lng: typeof item.longitude === 'number' ? item.longitude : parseFloat(item.longitude)
            },
            available: item.available,
            rating: 4.8, // Default rating
            reviewCount: 0,
            ownerId: item.ownerId
        }));
        log(`Mapped ${objects.length} objects.`);

        // 3. Send
        log('Sending to Algolia...');
        const result = await index.saveObjects(objects);

        log(`Sent! Task IDs: ${result.taskIDs.join(', ')}`);
        log(`ObjectIDs: ${result.objectIDs.length}`);

        log('Waiting for tasks...');
        for (const tid of result.taskIDs) {
            await index.waitTask(tid);
        }
        log('Task finished. Index should exist.');

    } catch (error: any) {
        log(`ERROR: ${error.message}`);
        log(JSON.stringify(error, null, 2));
    }
}

syncAll();
