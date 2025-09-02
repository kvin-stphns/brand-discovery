export type Price = { value: number | undefined; currency?: string; originalValue?: number }

export type Product = {
  _id: string
  source: string
  sourceId: string
  canonicalUrl?: string
  title: string
  brand?: string
  price?: Price
  images: string[]
  description?: string
  details?: string[]
  sizes?: string[]
  availability?: string
  sku?: string
  color?: string
  category?: string[]
  breadcrumbs?: string[]
  shipping?: string
  returns?: string
  createdAt?: string
  updatedAt?: string
}

