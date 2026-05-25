const { composeOutboundUrl } = require('./partners')

function resolveAffiliateUrl(product, uiSource = 'grid', utm = 'mvp') {
  if (product?.affiliateUrl) return product.affiliateUrl
  const url = product?.canonicalUrl || product?.url || ''
  return composeOutboundUrl(url, uiSource, `ds-${utm}`)
}

module.exports = { resolveAffiliateUrl }
