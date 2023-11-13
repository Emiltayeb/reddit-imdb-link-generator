import { runtime,storage } from 'webextension-polyfill'
import { Actions } from '../helpers/tabs';
import { DATA_ID_ATTR, filterProcessedNodes, getPagePostAndSite, getSingleDomElement } from '../helpers/content';
import { processMovieTitlesAndIds } from '../helpers/content/get-commenst';
import { Message } from '../helpers/types';


const handlePopupOpen = async () => {
  const {postId,site} = getPagePostAndSite();
  if(!postId || !site) return;

  const moviesStorageByPost  = ((await storage.local.get(postId))[postId] || [])
  .filter(({id}:{id:string})=>{
    const node = getSingleDomElement(`[${DATA_ID_ATTR}="${id}"]`)
    return filterProcessedNodes(node)
  });
  const currentPostMovies =  processMovieTitlesAndIds(site);
  console.log({
    moviesStorageByPost,
    currentPostMovies
  });
  
  if(moviesStorageByPost?.length < currentPostMovies?.length){
    const finalMoviesAndIds = [...moviesStorageByPost,...currentPostMovies];

    if(finalMoviesAndIds.length){
      await storage.local.set({[postId]: finalMoviesAndIds})
    }
  } 

}


export function init() {
  runtime.onMessage.addListener(async (message: Message) => {
    if(message.to !== 'content') return
    console.log('message',message);
    if (message.action === Actions.POPUP_OPEN) {
      await handlePopupOpen()
    }
 
  })
 
}

init()
