import { MovieDataResponse } from '../background/types'
import { SupportedSites } from './content'
import { Actions } from './tabs'

export type Nullable<T> = T | null | undefined
type Entices = 'popup' | 'content' | 'background'
export type Message = {
  from?: Entices
  to?: Entices
  action: Actions
  data?: any
  mock?: boolean
}

export type SupportedSitesUrls = (typeof SupportedSites)[keyof typeof SupportedSites]

export type Cache = Record<
  string,
  {
    movies: Record<string, MovieDataResponse>
    comments: Record<string, string[]>
  }
>
