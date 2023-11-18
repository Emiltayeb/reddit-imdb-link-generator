import { runtime } from "webextension-polyfill";
import { Message } from "../types";
import { ROVIE_DAILOG_ID, ROVIE_ID, SupportedSites, config } from "./constants";
import { Actions } from "../tabs";
import { escapeRegExp, logger } from "../utils";
import { getUniqueId } from "./utils";
import { MovieDataResponse } from "../../background/types";

const components = {
  loadingSvg:`<svg id="rovie-loader" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="128px" height="128px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
  <path d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="" stroke="none">
    <animateTransform attributeName="transform" type="rotate" dur="1.408450704225352s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"/>
  </path>
  </svg>
  `,
  injectMovieDataToDialog: (dialog:HTMLDialogElement,movieData:MovieDataResponse)=> `
  <img src="${movieData.Poster}" alt="${movieData.Title}" />
  <div class="movie-details">
    <h2>${movieData.Title}
    <span class="rating">
      ${movieData.imdbRating}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="ipc-icon ipc-icon--star sc-bde20123-4 frBGmx" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"></path></svg>
    </span>
    </h2>
    <p>${movieData.Plot}</p>
  </div>
`
}

export const createFetchMovieDataButton = function (movieTitle:string) {
  const buttonEl = document.createElement("button");
  buttonEl.textContent = movieTitle;
  buttonEl.classList.add("rovie-btn");
  buttonEl.setAttribute("data-movie-title", movieTitle);
  return buttonEl.outerHTML;
}


const setDialogPosition = function (dialog:HTMLDialogElement,target:HTMLElement) {
  const rect = target.getBoundingClientRect();
  const leftPosition = rect.left;
  const topPoison = rect.top + window.scrollY + 20;
  dialog.setAttribute("style",`top:${topPoison}px;left:${leftPosition}px;`)
}
const onMovieTitleFetchClick = async function (e:Event) {
  e.stopPropagation();
  const target = e.target as HTMLElement;
  const movieTitle = target.getAttribute("data-movie-title");
  if(!movieTitle) return;
  const dialog = document.querySelector(`[data-dialog="${ROVIE_DAILOG_ID}"]`) as HTMLDialogElement;
  setDialogPosition(dialog,target);
  dialog.innerHTML = components.loadingSvg;
  dialog.show();
  const response =  await runtime.sendMessage({to:"background",data:movieTitle,action:Actions.FETCH_MOVIE_DATA,mock:true} as Message);
  dialog.innerHTML = components.injectMovieDataToDialog(dialog,response);
}
const renderMovieInComment = function (postElement: Element, moviesFound: string[]) {
  if(!postElement?.textContent || !moviesFound?.length) return;
  const posCommentSeances = Array.from(postElement.querySelectorAll("p"));
  if(!posCommentSeances.length) return;
  posCommentSeances.forEach((p)=>{
    const regex = new RegExp(escapeRegExp(moviesFound.join("|")), "gi");
    p.innerHTML = (p.innerHTML!).replace(regex,(movieTitle)=>createFetchMovieDataButton(movieTitle))
  })
  postElement.addEventListener("click",onMovieTitleFetchClick)
};




export const injectDialogIntoDom = function () {
  if(document.querySelector(`[data-dialog="${ROVIE_DAILOG_ID}"]`)) return;
  const dialogEl = document.createElement("dialog");
  dialogEl.addEventListener("click",(e)=>{
    e.stopPropagation();
  })
  dialogEl.setAttribute("data-dialog",ROVIE_DAILOG_ID);
  document.body.appendChild(dialogEl);
}

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
      if(!response?.movies) return;
      const movies = JSON.parse(response.movies)?.movies;
      renderMovieInComment(post,movies)
    } catch (error) {
      logger('handlePostInteraction error',error)
    }finally{
      post.setAttribute(ROVIE_ID,getUniqueId());
    }
}
  