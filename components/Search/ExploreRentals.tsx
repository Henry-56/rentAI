import React, { useEffect, useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, useRefinementList, RangeInput, Configure, useHits, useInstantSearch } from 'react-instantsearch';
import { MapPin, Star, Zap, ShoppingBag, TrendingUp, Check } from 'lucide-react';
import { Item } from '../../types';
import { initInsights, trackClick, getUserToken } from '../../utils/algoliaInsights';
import { getCookie, setCookie, PREF_COOKIE_NAME } from '../../utils/cookieUtils';

// Initialize search client with Public Search Key
const searchClient = algoliasearch(
    import.meta.env.VITE_ALGOLIA_APP_ID || '',
    import.meta.env.VITE_ALGOLIA_SEARCH_KEY || ''
);

// Custom Hits Component for Grid Control and Insights tracking
const CustomHits = ({ onRentalClick }: { onRentalClick: (item: any) => void }) => {
    const { hits, results } = useHits();
    const indexName = results?.index || 'rental_items';
    const [localPref, setLocalPref] = useState<string | null>(null);

    useEffect(() => {
        setLocalPref(getCookie(PREF_COOKIE_NAME));
    }, [hits]);


    if (hits.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <ShoppingBag size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No se encontraron artículos</h3>
                <p className="text-slate-500 mt-2">Intenta con otros filtros o términos de búsqueda.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hits.map((hit: any, index) => {
                // Determine if item matches local preference for immediate feedback
                const isPreferred = localPref && hit.category === localPref;
                // Use either Algolia score OR local match
                const showBadge = (hit._rankingInfo?.personalization?.score > 0) || isPreferred;

                return (
                    <div
                        key={hit.objectID}
                        onClick={() => {
                            // Track Click Event (algolia-insights)
                            trackClick({
                                objectID: hit.objectID,
                                indexName: indexName,
                                queryID: hit.__queryID, // Algolia returns this if clickAnalytics is true
                                position: index + 1
                            });

                            // Immediate Feedback: Update local preference based on interaction
                            if (hit.category) {
                                setCookie(PREF_COOKIE_NAME, hit.category, 30);
                                setLocalPref(hit.category); // Trigger re-render to show badge elsewhere immediately
                            }

                            onRentalClick({
                                ...hit,
                                id: hit.objectID,
                                coordinates: hit._geoloc || hit.coordinates || { lat: -12.068, lng: -75.210 },
                                available: hit.available ?? true,
                                rating: hit.rating ?? 0,
                                reviewCount: hit.reviewCount ?? 0
                            });
                        }}
                        className={`bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer h-full flex flex-col relative ${showBadge ? 'ring-2 ring-indigo-500/20' : ''}`}
                    >
                        {/* Personalized Badge (Simulated or Real if userScore > X) */}
                        {showBadge && (
                            <div className="absolute top-3 left-3 z-10 animate-fade-in-up">
                                <span className="bg-indigo-600/90 backdrop-blur text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                                    <TrendingUp size={10} /> Recomendado para ti
                                </span>
                            </div>
                        )}

                        <div className="relative h-48 overflow-hidden bg-slate-100">
                            <img
                                src={hit.imageUrl}
                                alt={hit.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase text-indigo-600 shadow-sm">
                                S/ {hit.pricePerDay} / día
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-black text-slate-800 text-sm leading-tight">{hit.title}</h3>
                                {hit.available ? (
                                    <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Disponible</span>
                                ) : (
                                    <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">En uso</span>
                                )}
                            </div>

                            <p className="text-slate-500 text-xs mb-3 line-clamp-2 flex-1">{hit.description}</p>

                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-auto pt-3 border-t border-slate-50">
                                <div className="flex items-center gap-1">
                                    <MapPin size={12} /> {hit.location || "Huancayo"}
                                </div>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={12} fill="currentColor" /> {hit.rating || 4.8}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

// Custom Refinement List to Sort by Preference
const CustomRefinementList = (props: any) => {
    const { items, refine } = useRefinementList(props);
    const savedCategory = getCookie(PREF_COOKIE_NAME);

    // Sort items: preferred category first, then by count descending
    const sortedItems = [...items].sort((a, b) => {
        if (a.label === savedCategory) return -1;
        if (b.label === savedCategory) return 1;
        return b.count - a.count;
    });

    return (
        <div className="space-y-2">
            {sortedItems.map(item => (
                <div
                    key={item.label}
                    onClick={() => refine(item.value)}
                    className={`flex items-center gap-2 cursor-pointer group ${item.isRefined ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.isRefined ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'
                        }`}>
                        {item.isRefined && <Check size={10} className="text-white" />}
                    </div>
                    <span className={`text-sm font-bold ${item.isRefined ? 'text-indigo-600' : 'text-slate-600'}`}>
                        {item.label}
                    </span>
                    {item.label === savedCategory && (
                        <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded ml-1">
                            Fav
                        </span>
                    )}
                    <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black">
                        {item.count}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const ExploreRentals = ({
    onRentalClick,
    initialQuery = '',
    initialCategory = 'Todos'
}: {
    onRentalClick: (item: any) => void;
    initialQuery?: string;
    initialCategory?: string;
}) => {
    const [userToken, setUserToken] = useState<string | undefined>(undefined);
    const [boostCategory, setBoostCategory] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Initialize Insights
        initInsights();
        const token = getUserToken();
        if (token) setUserToken(token);

        // Get saved preference for boosting, but if initialCategory is set explicitly by user (via Navbar), it acts as a filter
        const pref = getCookie(PREF_COOKIE_NAME);
        if (pref && pref !== 'Todos') {
            setBoostCategory(pref);
        }
    }, []);

    // If a category is selected in the Navbar (and it's not 'Todos'), we filter by it.
    // If 'Todos', we don't filter (undefined).
    const categoryFilter = initialCategory !== 'Todos' ? [`category:${initialCategory}`] : undefined;

    return (
        <div className="w-full">
            <InstantSearch
                searchClient={searchClient}
                indexName={import.meta.env.VITE_ALGOLIA_INDEX_NAME || "rental_items"}
                routing={true}
                insights={true} // Enable Insights Middleware automatically
            >
                {/* 
                    Configure Personalization & Boosting:
                    1. userToken: Associates events with this user.
                    2. enablePersonalization: Tells Algolia to use the user profile.
                    3. clickAnalytics: Required for queryID in hits.
                    4. query: Driven by global navbar search
                    5. facetFilters: Driven by category dropdown
                */}
                <Configure
                    hitsPerPage={9}
                    clickAnalytics={true}
                    enablePersonalization={true}
                    userToken={userToken}
                    query={initialQuery}
                    facetFilters={categoryFilter}
                    optionalFilters={boostCategory ? [`category:${boostCategory}`] : undefined}
                />

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full md:w-64 shrink-0 space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Categoría</h3>
                            <CustomRefinementList attribute="category" />
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Precio Diario</h3>
                            <RangeInput attribute="pricePerDay" classNames={{
                                form: 'flex items-center gap-2',
                                input: 'w-20 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors',
                                submit: 'hidden',
                                separator: 'text-slate-300'
                            }} />
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1">
                        <div className="mb-6 relative">
                            <SearchBox
                                placeholder="¿Qué estás buscando hoy?"
                                classNames={{
                                    root: 'w-full',
                                    form: 'relative w-full',
                                    input: 'w-full pl-12 pr-12 py-4 bg-white border-none rounded-[1.5rem] shadow-sm text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400',
                                    submit: 'hidden',
                                    reset: 'hidden',
                                    loadingIcon: 'hidden'
                                }}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">
                                <Zap size={20} />
                            </div>
                        </div>

                        <CustomHits onRentalClick={onRentalClick} />
                    </div>
                </div>
            </InstantSearch>
        </div>
    );
};
