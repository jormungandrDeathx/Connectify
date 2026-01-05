export function getWebSocketURL(path){
    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    return `${protocol}://${import.meta.env.VITE_WS_URL}${path}`
}