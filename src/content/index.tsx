import { runtime } from 'webextension-polyfill'
import { Actions } from '../helpers/tabs';
import { ROVIE_ID, getPageInfo, getUniqueId, config, SupportedSites, handleMovieToOpen,  getCurrentSite, getImdbPageInfo, handleNewCommentAddedToDom, injectDialogIntoDom, ROVIE_DAILOG_ID } from '../helpers/content';
import { Message } from '../helpers/types';
import { logger } from '../helpers/utils';

const proceedCommentsMap:any = {};
const isCommentAlreadyProcessed = (comment:Element) => {
  const id = comment.getAttribute(ROVIE_ID);
  if(!id) return false;
  return proceedCommentsMap[id];
}


const initIntersectionObserver = (nodes?:Element[]) => {
   nodes = nodes || Array.from(document.querySelectorAll(config[SupportedSites.REDDIT].commentContent));
  let observer=  new IntersectionObserver(callbackFunction,{ root: null,rootMargin: '0px',threshold: 1});;
  function callbackFunction(entries:IntersectionObserverEntry[]){ 
    entries.forEach( async (entry)=>{
      if (entry.isIntersecting) {        
          handleNewCommentAddedToDom(entry.target);
         observer.unobserve(entry.target);
        }
    })
  }

  for (const p of nodes) {
    if(!p || isCommentAlreadyProcessed(p)) continue;
    const id = getUniqueId();
    p.setAttribute(ROVIE_ID,id);
    proceedCommentsMap[id] = p;
    observer.observe(p);
  }

}

const initMutationObserver = () => {
  function processComment(comment:any) {
    return comment.querySelector("[data-testid=comment]");
}
function getComments(parent:any) {
    return [...(parent ?? document).querySelectorAll(".Comment")].map(processComment);
}

function getNewComments(parent:any, oldComments:any) {
    const allComments = getComments(parent);
    return allComments.filter(comment => !oldComments.includes(comment));
}

let oldComments = getComments(document);
const mo = new MutationObserver(() => {
    const newComments = getNewComments(document, oldComments);
    oldComments = getComments(document);
    if (newComments.length > 0) {
        initIntersectionObserver(newComments);
    }
});
mo.observe(document, { attributes: true, childList: true, subtree: true });
}



const handleImdbPage = () => {
  const pageInfo  = getImdbPageInfo();
  if(!pageInfo) return;
  const {movieToOpen} = pageInfo;
  if(movieToOpen){
    return handleMovieToOpen();
  }
}

const handleRedditPage = (action:Actions) => {
  injectDialogIntoDom()
  const {postId,subReddit} = getPageInfo();
  switch (action) {
    case Actions.ANALYZE_MOVIE_IN_COMMENTS:
      if(!postId || !config[SupportedSites.REDDIT].allowedSubReddits.includes(subReddit)){
        return
      }
      initIntersectionObserver();
      initMutationObserver()
      break;
    default:
      break;
  }
  return true
}

runtime.onMessage.addListener(async ({to,from,action}: Message,sender) => {
  if(to !== "content") {
    return;
  };
  const site = getCurrentSite();
   logger(`onMessage ${from} -> ${to} -> action: "${action}", site: "${site}"`);
  switch (site) {
    case SupportedSites.IMDB:
      return handleImdbPage()
    case SupportedSites.REDDIT:
      return handleRedditPage(action)
    default:
      break;
  }
 
  return true
})


document.addEventListener("click",()=>{
  const dialogOpen = document.querySelector(`[data-dialog=${ROVIE_DAILOG_ID}][open]`) as HTMLDialogElement;
  console.log(dialogOpen);
  
  if(dialogOpen){
    dialogOpen.close();
  }
})

