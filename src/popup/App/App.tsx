import React, { useEffect } from 'react'
import './App.css'
import { runtime, storage, tabs} from 'webextension-polyfill'
import { Actions, getCurrentTab } from '../../helpers/tabs'
import { Message } from '../../helpers/types'
import { createImdbLink } from '../../helpers/content'


const ImdbLinkList = ({links}:{links:{text:string[],id:string}[]}) => {
  const onGoToLink = async (id:string) => {
    getCurrentTab().then((tab) => { 
      tabs.sendMessage(tab.id!, { from: 'popup', to: 'content', action: Actions.ON_SCROLL_TO_POST,data:id } as Message)
    })
  } 
    return  <ul>  
    {
      links.map(({text,id}) => {
        return <li key={id}>
          {
            text.map((text) => {
              return <li key={text}>
                <a href={createImdbLink(text)} target="_blank" rel="noreferrer">{text}</a>
                <button onClick={()=>onGoToLink(id)}>Go to pust</button>
              </li>
            })
          }
        </li>
      })
    }
    </ul>
}
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
        {
          !links.length ? <>
          <h4>There is no links</h4>
          </> : <ImdbLinkList links={links}/>
        }
    </div>
  )
}

export default App
