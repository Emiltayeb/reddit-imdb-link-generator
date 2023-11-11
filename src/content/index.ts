import { runtime } from 'webextension-polyfill'
import {Message } from "../background";
import { Actions } from '../helpers/tabs';
import { getPostId } from '../helpers/content';
import { getMovieTitlesAndIds } from '../helpers/content/get-commenst';



export function init() {
  runtime.onMessage.addListener(async (message: Message) => {
    if(message.to !== 'content') return

    const {postId,site} = getPostId()
    if(!postId){
      return;
    }
    
    if (message.action === Actions.POPUP_OPEN) {
      const viewableComments =  getMovieTitlesAndIds(site);

      console.log("CHANGE!", {
        
        viewableComments,
        site,
        postId
      });
      
    }
  })
 
}

init()
