export const logger = (...message: any) => {
  // const isDev = storage.local.get('isDev')
  // if(!isDev) return
  console.log(...message)
}

export const escapeRegExp = function (str: string) {
  return str.replace(/[.*+?^${}()[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, delay)
  }
}
