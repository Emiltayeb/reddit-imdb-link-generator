import { ROVIE_IMDB_URL_OPEN_QP } from "./constants";

export const getUniqueId = ()=> `${Math.random() * Date.now()}`;

export const createImdbHref = function (movieTitle:string) {
    const encodedSearchQuery = encodeURIComponent(movieTitle);
    const imdbSearchUrl = `https://www.imdb.com/find/?q=${encodedSearchQuery}&ref_=nv_sr_sm&${ROVIE_IMDB_URL_OPEN_QP}=${encodedSearchQuery}`;
    return imdbSearchUrl
  }