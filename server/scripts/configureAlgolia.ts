import algoliasearch from 'algoliasearch';

const APP_ID = 'HWKAPLYJ2L';
const ADMIN_KEY = '7ba35a485aaec21726a2ad8cf953edd8';
const INDEX_NAME = 'rental_items';

const client = algoliasearch(APP_ID, ADMIN_KEY);
const index = client.initIndex(INDEX_NAME);

async function configure() {
    console.log('⚙️ Configuring Algolia Index Settings...');
    try {
        const result = await index.setSettings({
            searchableAttributes: [
                'title',
                'description',
                'category',
                'location'
            ],
            attributesForFaceting: [
                'category',      // For RefinementList
                'available',
                'searchable(ownerId)',
                'pricePerDay'    // For RangeInput (needs to be numeric? auto-detected usually, or filterOnly)
            ],
            customRanking: [
                'desc(rating)',
                'desc(reviewCount)'
            ]
        });

        console.log(`✅ Settings updated! Task ID: ${result.taskID}`);
        await index.waitTask(result.taskID);
        console.log('✅ Configuration applied.');

    } catch (error) {
        console.error('❌ Configuration failed:', error);
    }
}

configure();
