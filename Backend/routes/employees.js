const router = require('express').Router()

const bcrypt = require('bcryptjs')

const { getPool } = require('../db')
const { optionalAuth } = require('../middleware/auth')

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const search = (req.query.search || '').toString().trim()

    let sql = `
      SELECT id, name, email, role, sales_count, total_sales
      FROM employees
    `
    const params = []
    if (search) {
      const q = `%${search}%`
      sql += ' WHERE name LIKE ? OR email LIKE ? OR role LIKE ?'
      params.push(q, q, q)
    }
    sql += ' ORDER BY name ASC'

    const [rows] = await pool.query(sql, params)
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        salesCount: Number(r.sales_count || 0),
        totalSales: Number(r.total_sales || 0),
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const { id, name, email, role, salesCount, totalSales, password } = req.body || {}
    if (!name || !email || !role) return res.status(400).json({ message: 'name, email, role are required' })

    const employeeId = (id || email).toString().toLowerCase()
    const salesNum = Number(salesCount || 0)
    const totalNum = Number(totalSales || 0)
    const passwordHash = password ? bcrypt.hashSync(password, 10) : null

    await pool.query(
      `
        INSERT INTO employees (id, name, email, role, password_hash, sales_count, total_sales)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          role = VALUES(role),
          password_hash = COALESCE(VALUES(password_hash), password_hash),
          sales_count = VALUES(sales_count),
          total_sales = VALUES(total_sales)
      `,
      [employeeId, name, email, role, passwordHash, salesNum, totalNum]
    )

    res.status(201).json({ ok: true, id: employeeId })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const employeeId = req.params.id
    const { name, email, role, salesCount, totalSales, password } = req.body || {}

    if (!name || !email || !role) return res.status(400).json({ message: 'name, email, role are required' })

    const salesNum = Number(salesCount || 0)
    const totalNum = Number(totalSales || 0)
    const passwordHash = password ? bcrypt.hashSync(password, 10) : null

    const [result] = await pool.query(
      `
        UPDATE employees
        SET name = ?, email = ?, role = ?, sales_count = ?, total_sales = ?, password_hash = COALESCE(?, password_hash)
        WHERE id = ?
      `,
      [name, email, role, salesNum, totalNum, passwordHash, employeeId]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Employee not found' })
    res.json({ ok: true, id: employeeId })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const employeeId = req.params.id
    await pool.query('DELETE FROM employees WHERE id = ?', [employeeId])
    res.json({ ok: true, id: employeeId })
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
          COUNT(*) AS totalEmployees,
          COALESCE(SUM(sales_count), 0) AS totalTransactions,
          COALESCE(SUM(total_sales), 0) AS totalSales
        FROM employees
      `
    )
    const row = rows[0] || {}
    res.json({
      totalEmployees: Number(row.totalEmployees || 0),
      totalTransactions: Number(row.totalTransactions || 0),
      totalSales: Number(row.totalSales || 0),
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router

