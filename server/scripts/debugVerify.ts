import algoliasearch from 'algoliasearch';
import fs from 'fs';
import path from 'path';

const APP_ID = 'HWKAPLYJ2L';
const ADMIN_KEY = '7ba35a485aaec21726a2ad8cf953edd8';
const INDEX_NAME = 'rental_items';

const logFile = path.join(process.cwd(), 'sync_log_2.txt');
const log = (msg: string) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

fs.writeFileSync(logFile, '--- Verify Start ---\n');

async function verify() {
    try {
        const client = algoliasearch(APP_ID, ADMIN_KEY);
        const index = client.initIndex(INDEX_NAME);

        log('Client initialized.');

        // Just check existence directly
        log(`Searching index '${INDEX_NAME}'...`);

        const result = await index.search('');

        log(`Search Result: Found ${result.nbHits} hits.`);
        log(`Hits: ${JSON.stringify(result.hits.slice(0, 1), null, 2)}`);

    } catch (error: any) {
        log(`ERROR: ${error.message}`);
        log(JSON.stringify(error, null, 2));
    }
}

verify();
