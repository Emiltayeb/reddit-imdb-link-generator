import { ROVIE_IMDB_URL_OPEN_QP, SupportedSites, SupportedSitesUrls } from "./constants";

export const getPageInfo =  () => {
    let postId = "",subReddit="",movieToOpen:string | null="";
    switch (window.location.hostname) {
        case SupportedSites.REDDIT:
         postId = window.location.href.split("/")[6]
         subReddit = window.location.href.split("/")[4]
                break;
        default:
        case SupportedSites.IMDB:
             movieToOpen = new URLSearchParams(window.location.search).get(ROVIE_IMDB_URL_OPEN_QP);
            break;
    }
    return {postId,site:window.location.hostname as SupportedSitesUrls ,subReddit,movieToOpen};
}


export const getCurrentSite =  () => {
    switch (window.location.hostname) {
        case SupportedSites.REDDIT:
            return SupportedSites.REDDIT;
        default:
        case SupportedSites.IMDB:
            return SupportedSites.IMDB;
    }

}
export const getRedditPageInfo =  () => {
    if(window.location.hostname !== SupportedSites.REDDIT) return null;
    return {    
        postId: window.location.href.split("/")[6],
        subReddit: window.location.href.split("/")[4],
        site:window.location.hostname as SupportedSitesUrls,
    }
}

export const getImdbPageInfo = () => {
    if(window.location.hostname !== SupportedSites.IMDB) return null;
    return {    
        movieToOpen: new URLSearchParams(window.location.search).get(ROVIE_IMDB_URL_OPEN_QP),
        site:window.location.hostname as SupportedSitesUrls,
    }
}