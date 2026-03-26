const router = require('express').Router()

const { getPool } = require('../db')
const { optionalAuth } = require('../middleware/auth')

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const search = (req.query.search || '').toString().trim()

    let sql = `
      SELECT id, name, type, value, code, active
      FROM discounts
    `
    const params = []
    if (search) {
      const q = `%${search}%`
      sql += ' WHERE name LIKE ? OR code LIKE ? OR type LIKE ?'
      params.push(q, q, q)
    }
    sql += ' ORDER BY name ASC'

    const [rows] = await pool.query(sql, params)
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        value: Number(r.value),
        code: r.code,
        active: Boolean(r.active),
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const { id, name, type, value, code, active } = req.body || {}

    if (!name || !type || value === undefined) return res.status(400).json({ message: 'name, type, value are required' })
    if (type !== 'percentage' && type !== 'fixed') return res.status(400).json({ message: 'type must be percentage or fixed' })

    const valueNum = Number(value)
    if (!Number.isFinite(valueNum) || valueNum < 0) return res.status(400).json({ message: 'value must be >= 0' })

    const discountId = (id || code || name).toString().toLowerCase().replace(/\s+/g, '-')
    const codeNorm = code ? code.toString().toUpperCase() : null

    await pool.query(
      `
        INSERT INTO discounts (id, name, type, value, code, active)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          type = VALUES(type),
          value = VALUES(value),
          code = VALUES(code),
          active = VALUES(active)
      `,
      [discountId, name, type, valueNum, codeNorm, Boolean(active)]
    )

    res.status(201).json({ ok: true, id: discountId })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const discountId = req.params.id
    const { name, type, value, code, active } = req.body || {}

    if (!name || !type || value === undefined) return res.status(400).json({ message: 'name, type, value are required' })
    if (type !== 'percentage' && type !== 'fixed') return res.status(400).json({ message: 'type must be percentage or fixed' })
    const valueNum = Number(value)
    if (!Number.isFinite(valueNum) || valueNum < 0) return res.status(400).json({ message: 'value must be >= 0' })

    const codeNorm = code ? code.toString().toUpperCase() : null
    const [result] = await pool.query(
      `
        UPDATE discounts
        SET name = ?, type = ?, value = ?, code = ?, active = ?
        WHERE id = ?
      `,
      [name, type, valueNum, codeNorm, Boolean(active), discountId]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Discount not found' })
    res.json({ ok: true, id: discountId })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const discountId = req.params.id
    const { active } = req.body || {}
    if (active === undefined) return res.status(400).json({ message: 'active is required' })

    const [result] = await pool.query(
      `UPDATE discounts SET active = ? WHERE id = ?`,
      [Boolean(active), discountId]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Discount not found' })
    res.json({ ok: true, id: discountId, active: Boolean(active) })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const discountId = req.params.id
    await pool.query('DELETE FROM discounts WHERE id = ?', [discountId])
    res.json({ ok: true, id: discountId })
  } catch (err) {
    next(err)
  }
})

router.get('/resolve', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const code = (req.query.code || '').toString().toUpperCase().trim()
    if (!code) return res.json({ discount: null })

    const [rows] = await pool.query(
      `
        SELECT id, name, type, value, code, active
        FROM discounts
        WHERE code = ? AND active = TRUE
        LIMIT 1
      `,
      [code]
    )
    const d = rows[0]
    res.json({
      discount: d
        ? {
            id: d.id,
            name: d.name,
            type: d.type,
            value: Number(d.value),
            code: d.code,
            active: Boolean(d.active),
          }
        : null,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router

