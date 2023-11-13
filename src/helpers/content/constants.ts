export const DATA_PROCESSED_ATTR = "data-processed";
export const DATA_ID_ATTR = "data-id";
export const IMDB_LINKS_IN_COMMENTS_SELECTOR = "imdb-link";
export const STORAGE_KEY = "movieLinks";
export const MINE_TITLE_LENGTH =3;
export const getCommentSelector = (id:string) => `[${DATA_ID_ATTR}='${id}']`;
export enum SupportedSites {
    REDDIT = "www.reddit.com",
}
export const siteCommentsSelectors =  {
    [SupportedSites.REDDIT] : "[data-testid='comment'] p",
}

