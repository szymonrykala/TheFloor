
const url = new URL(document.URL)
const base = `${url.hostname}:${import.meta.env.VITE_BACKEND_API_PORT || url.port}`

export const API_V1 = new URL("http://" + base + import.meta.env.VITE_BACKEND_API_PREFIX)
export const API_WS_V1 = new URL("ws://" + base + import.meta.env.VITE_BACKEND_API_PREFIX)