import { runtime, storage } from "webextension-polyfill"


export const logger = (...message: any) => {
    // const isDev = storage.local.get('isDev')
    // if(!isDev) return
    console.log(...message)
}