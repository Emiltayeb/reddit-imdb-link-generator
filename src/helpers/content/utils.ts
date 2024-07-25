import { MovieDataResponse } from '../../background/types'
import { Cache } from '../types'
import { logger } from '../utils'
import {
  ROVIE_IMDB_URL_OPEN_QP,
  ROVIE_LOCAL_STORAGE_KEY,
  SupportedSites,
  config,
} from './constants'
import { getPageInfo } from './get-page-info'

export const getUniqueId = () => `${Math.random() * Date.now()}`

export const createImdbHref = function (movieTitle: string) {
  const encodedSearchQuery = encodeURIComponent(movieTitle)
  const imdbSearchUrl = `https://www.imdb.com/find/?q=${encodedSearchQuery}&ref_=nv_sr_sm&${ROVIE_IMDB_URL_OPEN_QP}=${encodedSearchQuery}`
  return imdbSearchUrl
}

export const getCommentId = (comment:   undefined | HTMLElement | null) => {
  if (!comment) return ''
  const userInfo = comment.previousElementSibling?.querySelector("a")?.innerText?.trim()
  const postContent = comment?.innerText?.slice(0, 10)?.trim()
  return `${userInfo}-${postContent}`.replace(/\s/g, '')
}

export const isCommentInCache = (id: string) => {
  const cache = JSON.parse(localStorage.getItem(ROVIE_LOCAL_STORAGE_KEY) || '{}')
  return !!cache[id]
}
export const getCommentFromCache = (
  postElement: HTMLElement | undefined | null,
): string[] | undefined => {
  const { postId } = getPageInfo()
  const id = getCommentId(postElement)
  if (!id || !postId) return
  const cache = localStorage.getItem(ROVIE_LOCAL_STORAGE_KEY)
  if (!cache) return
  try {
    return (JSON.parse(cache) as Cache)[postId].comments[id]
  } catch (error) {
    return
  }
}

export const getMovieFromCache = (movieTitle: string): MovieDataResponse | undefined => {
  const { postId } = getPageInfo()
  if (!postId) return
  const cache = localStorage.getItem(ROVIE_LOCAL_STORAGE_KEY)
  if (!cache) return
  try {
    return (JSON.parse(cache) as Cache)[postId].movies[movieTitle]
  } catch (error) {
    return
  }
}
export const setCommentTextInCache = (
  postElement: HTMLElement | undefined | null,
  htmlTxt: string[],
) => {
  const id = getCommentId(postElement)
  const { postId } = getPageInfo()
  if (!id || !postId) return
  let currentCache = JSON.parse(
    localStorage.getItem(ROVIE_LOCAL_STORAGE_KEY) || '{}',
  ) as Cache
  if (!currentCache[postId]) currentCache[postId] = { comments: {}, movies: {} }
  currentCache[postId].comments[id] = htmlTxt
  localStorage.setItem(ROVIE_LOCAL_STORAGE_KEY, JSON.stringify(currentCache))
}

export const setMovieInCache = (movieTitle: string, movieData: MovieDataResponse) => {
  const { postId } = getPageInfo()
  if (!postId) return
  let currentCache = JSON.parse(
    localStorage.getItem(ROVIE_LOCAL_STORAGE_KEY) || '{}',
  ) as Cache
  if (!currentCache[postId].movies) currentCache[postId].movies = {}
  currentCache[postId].movies[movieTitle] = movieData
  localStorage.setItem(ROVIE_LOCAL_STORAGE_KEY, JSON.stringify(currentCache))
}
export const isCommentAlreadyProcessed = (comment: HTMLElement) => {
  const id = getCommentId(comment)
  if (!id) return false
  return isCommentInCache(id)
}
