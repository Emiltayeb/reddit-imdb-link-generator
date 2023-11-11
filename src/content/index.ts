import { runtime } from 'webextension-polyfill'
import {Message } from "../background";
import { extractValidMovieTitleFromText } from '../helpers/extract-movie-title';
import { Actions } from '../helpers/tabs';


export function init() {
  runtime.onMessage.addListener(async (message: Message) => {
    if(message.to !== 'content') return
    
    if (message.action === Actions.POPUP_OPEN) {
      console.log('content handled: ', message.action)
    }
  })
  extractValidMovieTitleFromText("The.Quick BrownFox, also i love The Dark")
}

init()
