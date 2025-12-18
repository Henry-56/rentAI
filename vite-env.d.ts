/// &lt;reference types="vite/client" /&gt;

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_CULQI_PUBLIC_KEY: string
    readonly CULQI_SECRET_KEY: string
    readonly VITE_ALGOLIA_APP_ID: string
    readonly VITE_ALGOLIA_SEARCH_KEY: string
    readonly VITE_ALGOLIA_INDEX_NAME: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
