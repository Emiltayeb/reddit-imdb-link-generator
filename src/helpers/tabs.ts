import { tabs } from 'webextension-polyfill'

export enum Actions {
POPUP_OPEN = 'popup-open',
ON_SCROLL_TO_POST = 'on-go-to-link',
ANALYZE_MOVIE_IN_COMMENTS = 'analyze-movie-in-comments',
FINISHED_ANALYZE_MOVIE_IN_COMMENTS = 'finished-process-comments',
FETCH_MOVIE_DATA = 'fetch-movie-data',
NO_MOVIES_FOUND = 'no-movies-found',
ATTACH_TAB_UPDATE = 'attach-tab-update',
}

export async function getCurrentTab() {
  const list = await tabs.query({ active: true, currentWindow: true })
  return list[0]
}


