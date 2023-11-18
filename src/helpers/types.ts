import { Actions } from "./tabs";

export type Nullable<T> = T | null | undefined;
type Entices =  "popup"| "content" | "background"
export type Message = {
    from?: Entices
    to?: Entices,
    action: Actions
    data?: any
    mock?: boolean
  }