export const USE_LIVE = process.env.NEXT_PUBLIC_USE_LIVE_API === 'true'
export const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || ''
export const LIVE_TIMEOUT_MS = 2000
export const LIVE_MODE_LABEL = USE_LIVE ? 'LIVE' : ''