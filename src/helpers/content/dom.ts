import { runtime } from "webextension-polyfill";
import { Message, Nullable } from "../types";
import { DATA_PROCESSED_ATTR, ROVIE_ID, ROVIE_IMDB_URL_OPEN_QP, SupportedSites, config } from "./constants";
import { Actions } from "../tabs";
import { logger } from "../utils";
import { getUniqueId } from "./utils";

const IMDB_STYLE = "color: rgb(245, 197, 24); text-decoration: underline; font-weight: bold;"

const escapeRegExp = function(str:string) {
  return str.replace(/[.*+?^${}()[\]\\]/g, '\\$&'); // $& means the whole matched string
}

 const createImdbHref = function (movieTitle:string) {
  const encodedSearchQuery = encodeURIComponent(movieTitle);
  const imdbSearchUrl = `https://www.imdb.com/find/?q=${encodedSearchQuery}&ref_=nv_sr_sm&${ROVIE_IMDB_URL_OPEN_QP}=${encodedSearchQuery}`;
  return imdbSearchUrl
  
}

export const getSingleDomElement = (selector:string)=>document.querySelector(selector);
export const getMultipleDomElements = (selector:string)=>document.querySelectorAll(selector);
export const filterProcessedNodes = function(node:Nullable<Element>) {
    return node?.getAttribute(DATA_PROCESSED_ATTR) !== "true";
}

export const createFetchMovieDataButton = function (movieTitle:string) {
  const buttonEl = document.createElement("button");
  buttonEl.textContent = movieTitle;
  buttonEl.setAttribute("style", IMDB_STYLE)
  buttonEl.setAttribute("data-movie-title", movieTitle);
  return buttonEl.outerHTML;
}
export const createImdbLink = function (movieTitle:string) {
  const linkEl = document.createElement("a");
  linkEl.href = createImdbHref(movieTitle);
  linkEl.target = "_blank";
  linkEl.rel = "noopener noreferrer";
  linkEl.textContent = movieTitle;
  linkEl.setAttribute("style", IMDB_STYLE)
  return linkEl.outerHTML;
} 

const renderMovieInComment = function (postElement: Element, moviesFound: string[]) {
  if(!postElement?.textContent || !moviesFound?.length) return;
  const posCommentSeances = Array.from(postElement.querySelectorAll("p"));
  if(!posCommentSeances.length) return;
  console.log('Inner html before',JSON.stringify(postElement.innerHTML,null ,2));
  posCommentSeances.forEach((p)=>{
    const regex = new RegExp(escapeRegExp(moviesFound.join("|")), "gi");
    p.innerHTML = (p.innerHTML!).replace(regex,(movieTitle)=>createFetchMovieDataButton(movieTitle))
  })
  postElement.addEventListener("click",async (e)=>{
    const target = e.target as HTMLElement;
    if(target.tagName !== "BUTTON") return;
    const movieTitle = target.getAttribute("data-movie-title");
    if(!movieTitle) return;
    const response =  await runtime.sendMessage({to:"background",data:movieTitle,action:Actions.FETCH_MOVIE_DATA,mock:true} as Message);
    console.log({response});
  })

};


export const handleMovieToOpen = () => {
   const firstResult = document.querySelector(config[SupportedSites.IMDB].firstMovieLink) as HTMLAnchorElement;
    if(!firstResult) return;
    firstResult.click();
}
export const handleNewCommentAddedToDom = async  (post:IntersectionObserverEntry["target"]) => {
    try {
      // set unique id for the post so we can get it later
      const postText =post.textContent;
      const response =  await runtime.sendMessage({to:"background",data:postText,action:Actions.ANALYZE_MOVIE_IN_COMMENTS,mock:true} as Message);
      console.log({response});
      if(!response?.movies) return;
      const movies = JSON.parse(response.movies)?.movies;
      renderMovieInComment(post,movies)
    } catch (error) {
      logger('handlePostInteraction error',error)
    }finally{
      post.setAttribute(ROVIE_ID,getUniqueId());
    }
}
  