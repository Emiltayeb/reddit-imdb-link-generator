import React, { useEffect } from 'react'
import './App.css'
import { tabs} from 'webextension-polyfill'
import { Message } from '../../background'
import { Actions, getCurrentTab } from '../../helpers/tabs'

function App() {
  useEffect(() => {
    console.log('popup opened');
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
