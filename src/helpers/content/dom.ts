import { runtime } from 'webextension-polyfill'
import { Message } from '../types'
import { ROVIE_DAILOG_ID, ROVIE_ID, SupportedSites, config } from './constants'
import { Actions } from '../tabs'
import { escapeRegExp, logger } from '../utils'
import {
  getCommentFromCache,
  getMovieFromCache,
  getUniqueId,
  setCommentTextInCache,
  setMovieInCache,
} from './utils'
import { MovieDataResponse } from '../../background/types'
import sanitizeHtml from 'sanitize-html'
import throttle from 'lodash.throttle'

const sanitizedRovie = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: ['button'],
    allowedAttributes: {
      button: ['class', 'data-*'],
    },
  })

const components = {
  loadingSvg: `<svg id="rovie-loader" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="128px" height="128px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
  <path d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="" stroke="none">
    <animateTransform attributeName="transform" type="rotate" dur="1.408450704225352s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"/>
  </path>
  </svg>
  `,
  injectMovieDataToDialog: (dialog: HTMLDialogElement, movieData: MovieDataResponse) => `
  <img src="${movieData.Poster}" alt="${movieData.Title}" />
  <div class="movie-details">
    <h2>
    <a href="https://www.imdb.com/title/${movieData.imdbID}/" target="_blank">${movieData.Title}</a>
    <span class="rating">
      ${movieData.imdbRating}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="ipc-icon ipc-icon--star sc-bde20123-4 frBGmx" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"></path></svg>
    </span>
    </h2>
    <p>${movieData.Plot}</p>
  </div>
`,
}

export const createFetchMovieDataButton = function (movieTitle: string) {
  const buttonEl = document.createElement('button')
  buttonEl.textContent = movieTitle
  buttonEl.classList.add('rovie-btn')
  buttonEl.setAttribute('data-movie-title', movieTitle)
  return buttonEl.outerHTML
}

const setDialogPosition = function (dialog: HTMLDialogElement, target: HTMLElement) {
  const rect = target.getBoundingClientRect()
  const leftPosition = rect.left
  const topPoison = rect.top + window.scrollY + 20
  dialog.setAttribute('style', `top:${topPoison}px;left:${leftPosition}px;`)
}
const onMovieTitleFetchClick = async function (e: Event) {
  e.stopPropagation()
  const target = e.target as HTMLElement
  const movieTitle = target.getAttribute('data-movie-title')
  if (!movieTitle) return
  const movieFromCache = getMovieFromCache(movieTitle)
  const dialog = document.querySelector(
    `[data-dialog="${ROVIE_DAILOG_ID}"]`,
  ) as HTMLDialogElement
  setDialogPosition(dialog, target)
  dialog.show()

  if (movieFromCache) {
    dialog.innerHTML = components.injectMovieDataToDialog(dialog, movieFromCache)
    return
  }
  dialog.innerHTML = components.loadingSvg
  // TODO add catch and set the movie in cache as null so we now to render no mvie data
  const response = await runtime.sendMessage({
    to: 'background',
    data: movieTitle,
    action: Actions.FETCH_MOVIE_DATA,
    mock: false,
  } as Message)
  // TODO what happends when there's no image, no rating ect?
  // mavey we should set this movie to just be opened in an imdb?
  // What happends when there's no imdbId? then mabey open in search
  setMovieInCache(movieTitle, response)
  dialog.innerHTML = components.injectMovieDataToDialog(dialog, response)
}
const renderMovieInComment = function (postElement: Element, moviesFound: string[]) {
  // check if the post already processed and display the cache version
  if (!postElement?.textContent || !moviesFound?.length) return
  const posCommentSeances = Array.from(postElement.querySelectorAll('p')).filter(
    (node) => node.querySelector('.rovie-btn') === null,
  )
  if (!posCommentSeances.length) return
  console.log({ posCommentSeances })
  posCommentSeances.forEach((p) => {
    const regex = new RegExp(escapeRegExp(moviesFound.join('|')), 'i')
    const updatedHtml = p.innerHTML!.replace(regex, (movieTitle) => {
      console.log({ movieTitle })
      return createFetchMovieDataButton(movieTitle)
    })
    console.log({ updatedHtml })
    p.innerHTML = sanitizedRovie(updatedHtml)
  })
  setCommentTextInCache(postElement.parentElement, moviesFound)
  postElement.addEventListener('click', onMovieTitleFetchClick)
}

export const injectDialogIntoDom = function () {
  if (document.querySelector(`[data-dialog="${ROVIE_DAILOG_ID}"]`)) return
  const dialogEl = document.createElement('dialog')
  dialogEl.addEventListener('click', (e) => {
    e.stopPropagation()
  })
  dialogEl.setAttribute('data-dialog', ROVIE_DAILOG_ID)
  document.body.appendChild(dialogEl)
}

export const handleMovieToOpen = () => {
  const firstResult = document.querySelector(
    config[SupportedSites.IMDB].selectors.firstMovieLink,
  ) as HTMLAnchorElement
  if (!firstResult) return
  firstResult.click()
}

export const handleNewCommentAddedToDom = throttle(
  async (post: IntersectionObserverEntry['target']) => {
    try {
      // set unique id for the post so we can get it later
      const commentCachedMovies = getCommentFromCache(post.parentElement)
      if (commentCachedMovies) {
        // TODO should be sanitized again
        renderMovieInComment(post, commentCachedMovies)
        return
      }
      const postText = post.textContent
      logger('calling api', postText)
      const response = await runtime.sendMessage({
        to: 'background',
        data: postText,
        action: Actions.ANALYZE_MOVIE_IN_COMMENTS,
        mock: false,
      } as Message)
      const movies = JSON.parse(response.movies)?.movies

      if (!movies?.length) {
        setCommentTextInCache(post.parentElement, [])
        return
      }
      renderMovieInComment(post, movies)
    } catch (error) {
      setCommentTextInCache(post.parentElement, [])
      logger('handlePostInteraction error', error)
    } finally {
      post.setAttribute(ROVIE_ID, getUniqueId())
    }
  },
  400,
)
