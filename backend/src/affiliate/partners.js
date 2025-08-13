function composeOutboundUrl(url, source = 'grid', utm) {
  try {
    const u = new URL(String(url))
    const host = u.hostname.toLowerCase()
    if (host.includes('ssense.com')) {
      u.searchParams.set('utm_source', utm || 'brand-discovery')
      u.searchParams.set('utm_medium', source)
      u.searchParams.set('affid', process.env.SSENSE_AFF_ID || 'partner')
    } else if (host.includes('farfetch.com')) {
      u.searchParams.set('utm_source', utm || 'brand-discovery')
      u.searchParams.set('utm_medium', source)
      u.searchParams.set('affid', process.env.FARFETCH_AFF_ID || 'partner')
    } else {
      if (utm) u.searchParams.set('utm_source', utm)
      u.searchParams.set('ref', process.env.AFFILIATE_REF || 'partner')
    }
    return u.toString()
  } catch (_e) {
    return String(url)
  }
}

module.exports = { composeOutboundUrl }