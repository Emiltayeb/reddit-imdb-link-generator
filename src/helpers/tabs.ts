import { tabs } from 'webextension-polyfill'

export enum Actions {
POPUP_OPEN = 'popup-open',
ON_SCROLL_TO_POST = 'on-go-to-link',
START_PROCESS_TEXT = 'start-process-text',
FINISHED_PROCESS_COMMENTS = 'finished-process-comments',
FETCH_MOVIE_DATA = 'fetch-movie-data',
NO_MOVIES_FOUND = 'no-movies-found',
}

export async function getCurrentTab() {
  const list = await tabs.query({ active: true, currentWindow: true })

  return list[0]
}


