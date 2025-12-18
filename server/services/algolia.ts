import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';
import { Item } from '../../types';

dotenv.config();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || 'rental_items';

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) {
    console.warn('⚠️  Algolia credentials missing. Search sync will be disabled.');
}

// Initialize Algolia Client with Admin Key for backend operations
const client = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_ADMIN_API_KEY || '');
const index = client.initIndex(ALGOLIA_INDEX_NAME);

export const algoliaService = {
    /**
     * Saves or updates an item in Algolia
     */
    async saveItem(item: Item) {
        if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) return;

        try {
            // Map Item to Algolia Object
            // We explicitly set objectID to the item.id for automatic updates/deduplication
            const algoliaObject = {
                objectID: item.id,
                title: item.title,
                description: item.description,
                category: item.category,
                pricePerDay: Number(item.pricePerDay), // Ensure number
                imageUrl: item.imageUrl,
                location: item.location,
                _geoloc: {
                    lat: item.coordinates.lat,
                    lng: item.coordinates.lng
                },
                available: item.available,
                rating: item.rating,
                reviewCount: item.reviewCount,
                ownerId: item.ownerId
            };

            await index.saveObject(algoliaObject);
            console.log(`✅ [Algolia] Saved item: ${item.title} (${item.id})`);
        } catch (error) {
            console.error(`❌ [Algolia] Error saving item ${item.id}:`, error);
        }
    },

    /**
     * Deletes an item from Algolia
     */
    async deleteItem(itemId: string) {
        if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) return;

        try {
            await index.deleteObject(itemId);
            console.log(`🗑️ [Algolia] Deleted item: ${itemId}`);
        } catch (error) {
            console.error(`❌ [Algolia] Error deleting item ${itemId}:`, error);
        }
    },

    /**
     * Batch imports/syncs multiple items
     */
    async syncAllItems(items: Item[]) {
        if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) {
            console.error('❌ Cannot sync: Missing Algolia credentials');
            return;
        }

        try {
            const objects = items.map(item => ({
                objectID: item.id,
                title: item.title,
                description: item.description,
                category: item.category,
                pricePerDay: Number(item.pricePerDay),
                imageUrl: item.imageUrl,
                location: item.location,
                _geoloc: {
                    lat: item.coordinates.lat,
                    lng: item.coordinates.lng
                },
                available: item.available,
                rating: item.rating,
                reviewCount: item.reviewCount,
                ownerId: item.ownerId
            }));

            const { objectIDs } = await index.saveObjects(objects);
            console.log(`🚀 [Algolia] Successfully synced ${objectIDs.length} items`);
        } catch (error) {
            console.error('❌ [Algolia] Sync error:', error);
        }
    }
};
