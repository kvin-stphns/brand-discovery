type EventProps = Record<string, string | number | boolean | null | undefined>

function devLog(event: string, props?: EventProps) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, props || {})
  }
}

export const Analytics = {
  track: (event: string, props?: EventProps) => devLog(event, props),
  nav: (label: string, href: string) => devLog('nav_click', { label, href }),
  view: (name: string) => devLog('view', { name }),
  cta: (label: string) => devLog('cta_click', { label }),
}
