/* eslint-disable no-undef */
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db')
const { importProducts } = require('../src/feeds/importer')
const { Product } = require('../models/productModel')
const { FeedImportLog } = require('../models/feedImportLogModel')

describe('feed importer', () => {
  beforeAll(async () => {
    process.env.MONGODB_IN_MEMORY = 'true'
    await connectToDatabase({ maxRetries: 1 })
  }, 30000)

  afterAll(async () => {
    await disconnectFromDatabase()
  }, 30000)

  it('imports valid normalized products and rejects invalid rows', async () => {
    const result = await importProducts(
      [
        {
          sourceId: 'feed-test-1',
          retailer: 'Test Boutique',
          canonicalUrl: 'https://example.com/product/feed-test-1',
          title: 'Clean Wool Jacket',
          brand: 'Test Atelier',
          price: { value: 450, currency: 'USD' },
          images: ['https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1200&q=85'],
          description: 'A clean product row.',
        },
        {
          sourceId: 'bad-row',
          title: '{ color: var(--broken) }',
          price: '0',
        },
      ],
      { source: 'test-feed', sourceType: 'manual-json', retailer: 'Test Boutique' }
    )

    expect(result.counts.imported).toBe(1)
    expect(result.counts.rejected).toBe(1)

    const product = await Product.findOne({ source: 'test-feed', sourceId: 'feed-test-1' }).lean()
    expect(product.title).toBe('Clean Wool Jacket')
    expect(product.dataQuality.score).toBeGreaterThanOrEqual(4)

    const log = await FeedImportLog.findById(result.logId).lean()
    expect(log.counts.imported).toBe(1)
  })
})
