export function toSlug(input: string) {
  return input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export type Section = 'discover' | 'brands' | 'categories' | 'designers' | 'rankings'

export function hrefFor(section: Section, category: string, link: string) {
  const cat = toSlug(category)
  if (cat === 'explore') return '/discover'

  const slug = toSlug(link)
  const base = `/${cat}/${section}`
  return slug === 'view-all' ? `${base}/view-all` : `${base}/${slug}`
}