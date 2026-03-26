const router = require('express').Router()

const { getPool } = require('../db')
const { optionalAuth } = require('../middleware/auth')

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const search = (req.query.search || '').toString().trim()

    let sql = `
      SELECT id, name, email, phone, loyalty_points, total_spent
      FROM customers
    `
    const params = []
    if (search) {
      const q = `%${search}%`
      sql += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?'
      params.push(q, q, q)
    }
    sql += ' ORDER BY name ASC'

    const [rows] = await pool.query(sql, params)
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        loyaltyPoints: Number(r.loyalty_points || 0),
        totalSpent: Number(r.total_spent || 0),
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const { id, name, email, phone, loyaltyPoints, totalSpent } = req.body || {}
    if (!name || !email) return res.status(400).json({ message: 'name and email are required' })

    const customerId = (id || email).toString().toLowerCase()
    const loyaltyNum = Number(loyaltyPoints || 0)
    const spentNum = Number(totalSpent || 0)
    if (!Number.isFinite(loyaltyNum) || loyaltyNum < 0) return res.status(400).json({ message: 'loyaltyPoints must be >= 0' })
    if (!Number.isFinite(spentNum) || spentNum < 0) return res.status(400).json({ message: 'totalSpent must be >= 0' })

    await pool.query(
      `
        INSERT INTO customers (id, name, email, phone, loyalty_points, total_spent)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          phone = VALUES(phone),
          loyalty_points = VALUES(loyalty_points),
          total_spent = VALUES(total_spent)
      `,
      [customerId, name, email, phone || null, loyaltyNum, spentNum]
    )

    res.status(201).json({ ok: true, id: customerId })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const customerId = req.params.id
    const { name, email, phone, loyaltyPoints, totalSpent } = req.body || {}

    if (!name || !email) return res.status(400).json({ message: 'name and email are required' })

    const loyaltyNum = Number(loyaltyPoints || 0)
    const spentNum = Number(totalSpent || 0)
    if (!Number.isFinite(loyaltyNum) || loyaltyNum < 0) return res.status(400).json({ message: 'loyaltyPoints must be >= 0' })
    if (!Number.isFinite(spentNum) || spentNum < 0) return res.status(400).json({ message: 'totalSpent must be >= 0' })

    const [result] = await pool.query(
      `
        UPDATE customers
        SET name = ?, email = ?, phone = ?, loyalty_points = ?, total_spent = ?
        WHERE id = ?
      `,
      [name, email, phone || null, loyaltyNum, spentNum, customerId]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' })
    res.json({ ok: true, id: customerId })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const customerId = req.params.id
    await pool.query('DELETE FROM customers WHERE id = ?', [customerId])
    res.json({ ok: true, id: customerId })
  } catch (err) {
    next(err)
  }
})

router.get('/stats', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const [rows] = await pool.query(
      `
        SELECT
          COUNT(*) AS totalCustomers,
          COALESCE(SUM(loyalty_points), 0) AS totalLoyaltyPoints,
          COALESCE(SUM(total_spent), 0) AS revenue
        FROM customers
      `
    )
    const row = rows[0] || {}
    res.json({
      totalCustomers: Number(row.totalCustomers || 0),
      totalLoyaltyPoints: Number(row.totalLoyaltyPoints || 0),
      revenue: Number(row.revenue || 0),
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router

