export function sanitizeText(input: unknown, maxLength = 120): string {
  if (!input) return ''
  let text = String(input)
  // Remove CSS var dumps or object-like strings
  text = text.replace(/var\([^)]*\)/gi, '')
  text = text.replace(/\{[^}]*\}/g, '')
  text = text.replace(/\[[^\]]*\]/g, '')
  text = text.replace(/class(Name)?\s*[:=]\s*[^\s,}]+/gi, '')
  text = text.replace(/\s+/g, ' ').trim()
  if (text.length > maxLength) {
    text = text.slice(0, maxLength - 1).trimEnd() + '…'
  }
  return text
}

export function formatPrice(value?: number, currency: string = 'USD'): string {
  if (value == null || isNaN(Number(value))) return ''
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value))
  } catch {
    return `$${Number(value).toFixed(2)}`
  }
}

