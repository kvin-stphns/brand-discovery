const express = require('express')
const router = express.Router()
const { listBrands, getBrand } = require('../controllers/brandController')

/**
 * @openapi
 * /brands:
 *   get:
 *     summary: List brands
 */
router.get('/', listBrands)

/**
 * @openapi
 * /brands/{id}:
 *   get:
 *     summary: Get brand by id
 */
router.get('/:id', getBrand)

module.exports = router