import algoliasearch from 'algoliasearch';

const APP_ID = 'HWKAPLYJ2L';
const SEARCH_KEY = 'cd6a8fc6c294d5dee397dbf14f7d1fb8';
const INDEX_NAME = 'rental_items';

async function check() {
    console.log(`Checking access with Search Key...`);
    try {
        const client = algoliasearch(APP_ID, SEARCH_KEY);
        const index = client.initIndex(INDEX_NAME);

        const result = await index.search('');
        console.log(`✅ Success! Found ${result.nbHits} hits.`);
    } catch (error: any) {
        console.error(`❌ Search Key Failed: ${error.message}`);
        console.error(JSON.stringify(error, null, 2));
    }
}

check();
