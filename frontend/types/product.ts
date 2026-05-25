export type Price = { value: number | undefined; currency?: string; originalValue?: number }

export type Product = {
  _id: string
  source: string
  sourceId: string
  retailer?: string
  retailerId?: string
  canonicalUrl?: string
  affiliateUrl?: string
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
  dataQuality?: {
    hasTitle?: boolean
    hasBrand?: boolean
    hasImage?: boolean
    hasPrice?: boolean
    hasDescription?: boolean
    score?: number
    issues?: string[]
  }
  createdAt?: string
  updatedAt?: string
}
