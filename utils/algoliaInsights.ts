import searchInsights from 'search-insights';

const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

let initialized = false;

export const initInsights = () => {
    if (initialized || !ALGOLIA_APP_ID || !ALGOLIA_API_KEY) return;

    // Check for cookie consent
    const consent = localStorage.getItem('rentai_cookie_consent');
    if (consent !== 'true') return;

    searchInsights('init', {
        appId: ALGOLIA_APP_ID,
        apiKey: ALGOLIA_API_KEY,
        useCookie: true, // Use Algolia's cookie for userToken if allowed
    });

    // Get or create persistent userToken
    let userToken = localStorage.getItem('rentai_user_token');
    if (!userToken) {
        userToken = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('rentai_user_token', userToken);
    }

    searchInsights('setUserToken', userToken);
    initialized = true;
};

export const getUserToken = () => {
    return localStorage.getItem('rentai_user_token');
};

export const trackClick = (clickData: { objectID: string; indexName: string; queryID?: string; position?: number }) => {
    if (!initialized) initInsights();

    // Safety check again for consent in case it was revoked (if we supported revocation)
    if (localStorage.getItem('rentai_cookie_consent') !== 'true') return;

    if (clickData.queryID) {
        // Clicked after search
        searchInsights('clickedObjectIDsAfterSearch', {
            eventName: 'Item Clicked',
            index: clickData.indexName,
            objectIDs: [clickData.objectID],
            positions: [clickData.position || 0],
            queryID: clickData.queryID
        });
    } else {
        // Generic click (browse)
        searchInsights('clickedObjectIDs', {
            eventName: 'Item Clicked (Browse)',
            index: clickData.indexName,
            objectIDs: [clickData.objectID]
        });
    }
};

export default searchInsights;
