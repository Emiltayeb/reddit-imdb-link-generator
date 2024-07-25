import { runtime } from 'webextension-polyfill'
import { Actions } from '../helpers/tabs'
import {
  getPageInfo,
  config,
  SupportedSites,
  handleMovieToOpen,
  getCurrentSite,
  getImdbPageInfo,
  handleNewCommentAddedToDom,
  injectDialogIntoDom,
  ROVIE_DAILOG_ID,
  getCommentId,
  isCommentAlreadyProcessed,
} from '../helpers/content'
import { logger } from '../helpers/utils'
import { Message } from '../helpers/types'

const observersMap = new Map<string, boolean>()

const initIntersectionObserver = (nodes?: HTMLElement[]) => {
  nodes = (
    nodes ||
    Array.from(
      document.querySelectorAll(config[SupportedSites.REDDIT].selectors.wholeComment),
    )
  ).filter((p) => !isCommentAlreadyProcessed(p))

  logger('[initIntersectionObserver]', {
    nodes,
    actual: document.querySelectorAll(config[SupportedSites.REDDIT].selectors.wholeComment)
  })
  let observer = new IntersectionObserver(callbackFunction, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  })
  function callbackFunction(entries: IntersectionObserverEntry[]) {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        logger('Observing intersecting:', entry.target)
        handleNewCommentAddedToDom(entry.target)
        observer.unobserve(entry.target)
      }
    })
  }

  for (const p of nodes) {
    const id = getCommentId(p as HTMLElement)
    if (!p || observersMap.has(id)) {
      observer.unobserve(p)
      continue
    }
    observersMap.set(id, true)
    observer.observe(p)
  }
}

const initMutationObserver = () => {
  function getComments(parent: any) {
    return [...(parent ?? document).querySelectorAll('.Comment')]
  }
  function getNewComments(parent: any, oldComments: any) {
    const allComments = getComments(parent)
    return allComments.filter(
      (comment) => !oldComments.includes(comment) && !isCommentAlreadyProcessed(comment),
    )
  }

  let oldComments = getComments(document)
  const mo = new MutationObserver(() => {
    const newComments = getNewComments(document, oldComments)
    oldComments = getComments(document)
    if (newComments.length > 0) {
      // logger('New comments added:', newComments)
      initIntersectionObserver(newComments)
    }
  })
  mo.observe(document, { attributes: true, childList: true, subtree: true })
}

const handleImdbPage = () => {
  const pageInfo = getImdbPageInfo()
  if (!pageInfo) return
  const { movieToOpen } = pageInfo
  if (movieToOpen) {
    return handleMovieToOpen()
  }
}

const handleRedditPage = (action: Actions) => {
  observersMap.clear()
  injectDialogIntoDom()
  const { postId, subReddit } = getPageInfo();
  console.log({ postId, subReddit, action });
  
  switch (action) {
    case Actions.ANALYZE_MOVIE_IN_COMMENTS:
      if (
        !postId ||
        !config[SupportedSites.REDDIT].allowedSubReddits.includes(subReddit)
      ) {
        return
      }
      if (
        !document.querySelector(
          config[SupportedSites.REDDIT].selectors.overlayScrollContainer,
        )
      ) {
        initIntersectionObserver()
      }
      initMutationObserver()
      break
    default:
      break
  }
  return true
}

runtime.onMessage.addListener(async ({ to, from, action }: Message, sender) => {
  if (to !== 'content') {
    return
  }
  const site = getCurrentSite();
  await new Promise((resolve) => setTimeout(resolve, 1500))
  logger(`onMessage ${from} -> ${to} -> action: "${action}", site: "${site}"`)
  switch (site) {
    case SupportedSites.IMDB:
      return handleImdbPage()
    case SupportedSites.REDDIT:
      return handleRedditPage(action)
    default:
      break
  }

  return true
})

document.addEventListener('click', () => {
  const dialogOpen = document.querySelector(
    `[data-dialog=${ROVIE_DAILOG_ID}][open]`,
  ) as HTMLDialogElement
  // logger(dialogOpen)

  if (dialogOpen) {
    dialogOpen.close()
  }
})
