import { runtime, tabs } from 'webextension-polyfill'
import { Message } from '../helpers/types'
import { LAMBDA_URL } from '../helpers/background/constants'
import { Actions } from '../helpers/tabs'
import { OMDB_MOVIE_MOCK } from '../helpers/background/mocks'
import { logger } from '../helpers/utils'

// runtime.onInstalled.addListener(() => {
// })

const sleep = () => new Promise((resolve) => setTimeout(resolve, 1000))

const renderMockMovie = async function (postText: string) {
  await sleep()
  const firstWords = postText.split(' ').slice(0, 3)
  return { movies: JSON.stringify({ movies: firstWords }) }
}

const handleLambdaRequest = async (url: string, body: any) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    logger(response)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    return null
  }
}
const handleAnalyzeMovieInCommentReq = async (postText: string, mock = false) => {
  logger('calling api 😢 ')
  if (mock) return renderMockMovie(postText)
  return await handleLambdaRequest(LAMBDA_URL, postText)
}

const handleFetchMovieDataReq = async (movieTitle: string, mock = false) => {
  logger('calling api 😢 ')
  if (mock) {
    await sleep()
    return OMDB_MOVIE_MOCK
  }
  return await handleLambdaRequest(`${LAMBDA_URL}?movieDetials=${movieTitle}`, movieTitle)
}
tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  logger('tab updated', tabId, changeInfo, tab)
  if (tab.status === 'complete') {
    tabs.sendMessage(tabId, {
      action: Actions.ANALYZE_MOVIE_IN_COMMENTS,
      from: 'background',
      to: 'content',
    } as Message)
  }
})

runtime.onMessage.addListener(async (message: Message, sender) => {
  const { to, data, action, mock } = message
  if (to !== 'background') return
  if (action === Actions.ANALYZE_MOVIE_IN_COMMENTS) {
    return handleAnalyzeMovieInCommentReq(data, mock)
  }
  if (action === Actions.FETCH_MOVIE_DATA) {
    return handleFetchMovieDataReq(data, mock)
  }
  return true
})
