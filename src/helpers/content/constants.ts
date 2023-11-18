export const DATA_PROCESSED_ATTR = "data-processed";
export const DATA_ID_ATTR = "data-id";
export const IMDB_LINKS_IN_COMMENTS_SELECTOR = "imdb-link";
export const STORAGE_KEY = "movieLinks";
export const MINE_TITLE_LENGTH =3;
export const ROVIE_ID = "rovie-id";
export const ROVIE_IMDB_URL_OPEN_QP="rovie-imdb-url-open";
export const ROVIE_DAILOG_ID = "rovie-dailog-id";
export const getCommentSelector = (id:string) => `[${DATA_ID_ATTR}='${id}']`;


export const SupportedSites =  {
    REDDIT: "www.reddit.com",
    IMDB: "www.imdb.com",
} as const

export type SupportedSitesUrls= typeof SupportedSites[keyof typeof SupportedSites];


export const config = {
    [SupportedSites.REDDIT] :{
        commentSelector: "[data-testid='comment']",
        allowedSubReddits: ["movies", "MovieSuggestions"] as string[]
    },
    [SupportedSites.IMDB] :{
        firstMovieLink:'.ipc-metadata-list-summary-item__c a'
    }
} as const

