const router = require('express').Router()

router.get('/health', (req, res) => {
  res.json({ ok: true })
})

router.use('/auth', require('./auth'))
router.use('/products', require('./products'))
router.use('/inventory', require('./inventory'))
router.use('/customers', require('./customers'))
router.use('/employees', require('./employees'))
router.use('/discounts', require('./discounts'))
router.use('/settings', require('./settings'))
router.use('/reports', require('./reports'))
router.use('/orders', require('./orders'))

module.exports = router

