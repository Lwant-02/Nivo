/// <reference types="vite/client" />

declare module '*.lottie' {
  const content: string
  export default content
}

declare module '*.mp3' {
  const src: string
  export default src
}

declare module '*.ogg' {
  const src: string
  export default src
}
