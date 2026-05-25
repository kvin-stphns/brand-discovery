function cleanText(value, maxLength = 500) {
  if (value === undefined || value === null) return '';
  let text = String(value);
  text = text.replace(/var\([^)]*\)/gi, '');
  text = text.replace(/\{[^}]*\}/g, '');
  text = text.replace(/\[[^\]]*\]/g, '');
  text = text.replace(/class(Name)?\s*[:=]\s*[^\s,}]+/gi, '');
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length > maxLength) text = text.slice(0, maxLength).trim();
  return text;
}

function slugify(value, fallback = 'item') {
  const slug = cleanText(value, 140)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || String(fallback).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item';
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(asArray);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return asArray(parsed);
      } catch {
        // continue to delimiter parsing
      }
    }
    return trimmed.split(/\s*[|;]\s*/).filter(Boolean);
  }
  if (typeof value === 'object') {
    if (value.url) return [value.url];
    if (value.src) return [value.src];
    if (value.label) return [value.label];
  }
  return [value];
}

function normalizeUrl(value) {
  const text = cleanText(value, 2000);
  if (!text) return '';
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.toString();
  } catch {
    return '';
  }
}

function normalizeImages(row) {
  const raw = [
    ...asArray(row.images),
    ...asArray(row.image),
    ...asArray(row.imageUrl),
    ...asArray(row.image_url),
    ...asArray(row.media),
  ];
  const blocked = ['bat.bing.com', 'googleadservices', 'doubleclick', 'facebook.com/tr'];
  return Array.from(new Set(raw.map(normalizeUrl).filter((url) => url && !blocked.some((bad) => url.includes(bad)))));
}

function normalizePrice(row) {
  const raw = row.price && typeof row.price === 'object' ? row.price : {};
  const valueCandidate =
    raw.value ??
    raw.amount ??
    row.priceValue ??
    row.price_value ??
    row.salePrice ??
    row.sale_price ??
    row.currentPrice ??
    row.current_price ??
    (typeof row.price === 'string' || typeof row.price === 'number' ? row.price : undefined);

  let value = Number(valueCandidate);
  if (!Number.isFinite(value) && typeof valueCandidate === 'string') {
    const match = valueCandidate.match(/(\d[\d,.]*)/);
    value = match ? Number(match[1].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.')) : NaN;
  }

  const currency =
    cleanText(raw.currency || row.currency || row.priceCurrency || row.price_currency || 'USD', 10).toUpperCase() || 'USD';

  const originalCandidate = raw.originalValue ?? row.originalPrice ?? row.original_price;
  const originalValue = originalCandidate === undefined || originalCandidate === '' ? undefined : Number(originalCandidate);

  return {
    value: Number.isFinite(value) && value > 0 ? value : undefined,
    currency,
    ...(Number.isFinite(originalValue) && originalValue > 0 ? { originalValue } : {}),
  };
}

function isGarbageText(text) {
  const t = cleanText(text, 300);
  if (!t || t.length < 2) return true;
  if (/\[object Object\]/i.test(String(text))) return true;
  if (/(\{|}|var\(|className|data-testid|querySelector|function\s*\()/i.test(String(text))) return true;
  if (/^(product|item|brand item)$/i.test(t)) return true;
  return false;
}

function normalizeAvailability(value) {
  const text = cleanText(value || 'in_stock', 80).toLowerCase();
  if (['in stock', 'instock', 'available', 'true'].includes(text)) return 'in_stock';
  if (['out of stock', 'sold out', 'unavailable', 'false'].includes(text)) return 'out_of_stock';
  if (['preorder', 'pre-order'].includes(text)) return 'preorder';
  if (['limited', 'low stock'].includes(text)) return 'limited';
  return text || 'in_stock';
}

function normalizeProduct(row, options = {}) {
  const source = cleanText(row.source || options.source || 'manual-json', 80);
  const sourceId = cleanText(row.sourceId || row.source_id || row.id || row.sku || row.externalId || row.external_id, 220);
  const canonicalUrl = normalizeUrl(row.canonicalUrl || row.canonical_url || row.url || row.productUrl || row.product_url);
  const affiliateUrl = normalizeUrl(row.affiliateUrl || row.affiliate_url || row.deepLink || row.deeplink || row.trackingUrl);
  const retailer = cleanText(row.retailer || row.retailerName || row.merchant || row.store || options.retailer || 'Discovery Demo', 120);
  const title = cleanText(row.title || row.name || row.productName || row.product_name, 180);
  const brand = cleanText(row.brand || row.designer || row.brandName || row.brand_name, 120);
  const price = normalizePrice(row);
  const images = normalizeImages(row);
  const description = cleanText(row.description || row.copy || row.longDescription || row.long_description, 1000);
  const details = asArray(row.details || row.attributes || row.materials).map((item) => cleanText(item, 180)).filter(Boolean);
  const sizes = asArray(row.sizes || row.size || row.variants).map((item) => cleanText(item, 80)).filter(Boolean);
  const category = asArray(row.category || row.categories || row.categoryPath || row.category_path)
    .map((item) => cleanText(item, 80))
    .filter(Boolean);
  const breadcrumbs = asArray(row.breadcrumbs || row.breadcrumb || row.categoryPath || row.category_path)
    .map((item) => cleanText(item, 80))
    .filter(Boolean);

  const issues = [];
  if (!source) issues.push('missing_source');
  if (!sourceId && !canonicalUrl) issues.push('missing_source_id');
  if (isGarbageText(title)) issues.push('missing_or_garbage_title');
  if (isGarbageText(brand)) issues.push('missing_or_garbage_brand');
  if (!images.length) issues.push('missing_image');
  if (!price.value) issues.push('missing_or_invalid_price');

  const dataQuality = {
    hasTitle: !isGarbageText(title),
    hasBrand: !isGarbageText(brand),
    hasImage: images.length > 0,
    hasPrice: Boolean(price.value),
    hasDescription: Boolean(description),
    score: 0,
    issues,
  };
  dataQuality.score = [
    dataQuality.hasTitle,
    dataQuality.hasBrand,
    dataQuality.hasImage,
    dataQuality.hasPrice,
    dataQuality.hasDescription,
  ].filter(Boolean).length;

  const finalSourceId = sourceId || canonicalUrl;
  const product = {
    source,
    sourceId: finalSourceId,
    canonicalUrl,
    affiliateUrl,
    retailer,
    title,
    slug: slugify(`${brand} ${title}`, finalSourceId),
    brand,
    gender: cleanText(row.gender || row.department || row.audience || 'Unisex', 40) || 'Unisex',
    price,
    images,
    description,
    details,
    sizes,
    availability: normalizeAvailability(row.availability),
    sku: cleanText(row.sku || row.mpn || '', 120),
    color: cleanText(row.color || row.colour || '', 80),
    category,
    breadcrumbs,
    shipping: cleanText(row.shipping || '', 500),
    returns: cleanText(row.returns || row.returnPolicy || row.return_policy || '', 500),
    dataQuality,
  };

  return {
    product,
    valid: issues.length === 0,
    issues,
  };
}

module.exports = {
  cleanText,
  slugify,
  asArray,
  normalizeProduct,
  normalizeUrl,
};
