const express = require('express')
const router = express.Router()
const { listBrands, getBrand, createBrand, updateBrand } = require('../controllers/brandController')
const { authRequired, adminOnly } = require('../src/middleware/auth')
const { validate, Joi } = require('../src/middleware/validate')

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

router.post(
  '/',
  authRequired,
  adminOnly,
  validate({
    body: Joi.object({
      name: Joi.string().required(),
      slug: Joi.string().required(),
      image: Joi.string().uri().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      location: Joi.string().optional(),
      links: Joi.object({ website: Joi.string().uri().optional(), instagram: Joi.string().optional(), twitter: Joi.string().optional(), shop: Joi.string().uri().optional() }).optional(),
    }),
  }),
  createBrand
)

router.patch(
  '/:id',
  authRequired,
  adminOnly,
  validate({
    params: Joi.object({ id: Joi.string().length(24).hex().required() }),
    body: Joi.object({
      name: Joi.string().optional(),
      slug: Joi.string().optional(),
      image: Joi.string().uri().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      location: Joi.string().optional(),
      links: Joi.object({ website: Joi.string().uri().optional(), instagram: Joi.string().optional(), twitter: Joi.string().optional(), shop: Joi.string().uri().optional() }).optional(),
    }).min(1),
  }),
  updateBrand
)

module.exports = router