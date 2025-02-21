export const placeholderImages = {
  product: {
    default: '/placeholders/product-default.jpg',
    variants: [
      '/placeholders/product-1.jpg',
      '/placeholders/product-2.jpg',
      '/placeholders/product-3.jpg',
      '/placeholders/product-4.jpg'
    ]
  },
  brand: {
    default: '/placeholders/brand-default.jpg',
    variants: [
      '/placeholders/brand-1.jpg',
      '/placeholders/brand-2.jpg',
      '/placeholders/brand-3.jpg',
      '/placeholders/brand-4.jpg'
    ],
    logo: '/placeholders/brand-logo.png'
  },
  designer: {
    default: '/placeholders/designer-default.jpg',
    variants: [
      '/placeholders/designer-1.jpg',
      '/placeholders/designer-2.jpg',
      '/placeholders/designer-3.jpg',
      '/placeholders/designer-4.jpg'
    ]
  }
} as const

export const getPlaceholderImage = (
  type: 'product' | 'brand' | 'designer',
  index?: number
) => {
  if (typeof index === 'number') {
    const variants = placeholderImages[type].variants
    return variants[index % variants.length]
  }
  return placeholderImages[type].default
} 