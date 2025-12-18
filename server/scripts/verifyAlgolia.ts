import algoliasearch from 'algoliasearch';
const client = algoliasearch('HWKAPLYJ2L', '7ba35a485aaec21726a2ad8cf953edd8');
const index = client.initIndex('rental_items');

async function checkIndex() {
    try {
        const { nbHits } = await index.search('');
        console.log(`Index 'rental_items' has ${nbHits} hits.`);
        if (nbHits > 0) {
            const hits = await index.search('', { hitsPerPage: 1 });
            console.log('Sample hit:', hits.hits[0]);
        }
    } catch (error) {
        console.error('Error checking index:', error);
    }
}

checkIndex();
