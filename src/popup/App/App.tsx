import React, { useEffect } from 'react'
import './App.css'
import { runtime, storage, tabs} from 'webextension-polyfill'
import { Actions, getCurrentTab } from '../../helpers/tabs'
import { Message } from '../../helpers/types'


function App() {
  const [links, setLinks] = React.useState<{text:string[],id:string}[]>([])
  const setLinksToStorage = async (postId:string) => {
    const result = await storage.local.get(postId)
    const links = result?.[postId]
    if(!links) {
      return
    }
    setLinks(links)
  }

  useEffect(() => {
    runtime.onMessage.addListener((message: Message) => {
      if(message.to !== "popup") return
      const { action } = message
      if(action === Actions.FINISHED_ANALYZE_MOVIE_IN_COMMENTS){
        setLinksToStorage(message.data)
      }
  })

    getCurrentTab().then((tab) => { 
      tabs.sendMessage(tab.id!, { from: 'popup', to: 'content', action: Actions.POPUP_OPEN } as Message)
    })
  }, [])
  
  return (
    <div className="App">
      <h3>Imdb links from  text finder</h3>
    
    </div>
  )
}

export default App
