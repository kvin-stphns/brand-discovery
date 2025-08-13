export function toSlug(input: string) {
  return input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export type Section = 'discover' | 'brands' | 'categories' | 'designers' | 'rankings'

export function hrefFor(section: Section, category: string, link: string) {
  const cat = toSlug(category)
  const slug = toSlug(link)

  // Special-case: Location maps page
  if (section === 'discover' && slug === 'location') {
    return '/discover/map'
  }

  // Explore is a distinct area
  if (cat === 'explore') {
    return '/explore'
  }

  if (cat === 'explore') return '/explore'

  const base = `/${cat}/${section}`
  return slug === 'view-all' ? `${base}/view-all` : `${base}/${slug}`
}