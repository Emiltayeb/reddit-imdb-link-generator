import { Actions } from "./tabs";

export type Nullable<T> = T | null | undefined;
export type Message = {
    from: string
    to: string
    action: Actions
    data?: any
  }