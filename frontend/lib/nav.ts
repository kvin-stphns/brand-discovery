import { toSlug } from '@/lib/str'

export type Section = 'discover' | 'brands' | 'categories' | 'designers' | 'rankings'

export function hrefFor(section: Section, category: string, link: string) {
  const cat = toSlug(category)
  const slug = toSlug(link)

  // Special-case: Location maps page
  if (section === 'discover' && slug === 'location') {
    return '/discover/map'
  }

  // Rankings special routes
  if (section === 'rankings') {
    const baseCategory = cat === 'explore' ? 'explore' : cat
    const base = `/${baseCategory}/rankings`
    if (slug === 'leaderboard' || slug === 'view-all') return base
    if (slug === 'locations' || slug === 'location') return `${base}/location`
    if (slug === 'most-liked') return `${base}/most-liked`
    if (slug === 'most-viewed') return `${base}/most-viewed`
    if (slug === 'recently-liked') return `${base}/recently-liked`
    return base
  }

  // Explore is a first-class base category
  const baseCategory = cat === 'explore' ? 'explore' : cat
  const base = `/${baseCategory}/${section}`
  return slug === 'view-all' ? `${base}/view-all` : `${base}/${slug}`
}