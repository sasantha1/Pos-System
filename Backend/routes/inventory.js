const router = require('express').Router()

const { getPool } = require('../db')
const { optionalAuth } = require('../middleware/auth')

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 20)

router.get('/items', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const search = (req.query.search || '').toString().trim()

    let sql = `
      SELECT
        p.id,
        p.name AS product,
        p.barcode,
        p.category,
        p.price,
        i.stock
      FROM products p
      JOIN inventory_items i ON i.product_id = p.id
    `
    const params = []

    if (search) {
      const q = `%${search}%`
      sql += `
        WHERE p.name LIKE ? OR p.barcode LIKE ? OR p.category LIKE ?
      `
      params.push(q, q, q)
    }

    sql += ' ORDER BY p.name ASC'
    const [rows] = await pool.query(sql, params)
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        product: r.product,
        barcode: r.barcode,
        category: r.category,
        price: Number(r.price),
        stock: Number(r.stock),
      })),
    })
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
          COUNT(*) AS totalProducts,
          SUM(CASE WHEN i.stock > 0 AND i.stock <= ? THEN 1 ELSE 0 END) AS lowStockItems,
          SUM(CASE WHEN i.stock = 0 THEN 1 ELSE 0 END) AS outOfStock,
          COALESCE(SUM(p.price * i.stock), 0) AS inventoryValue
        FROM inventory_items i
        JOIN products p ON p.id = i.product_id
      `,
      [LOW_STOCK_THRESHOLD]
    )
    const row = rows[0] || {}
    res.json({
      totalProducts: Number(row.totalProducts || 0),
      lowStockItems: Number(row.lowStockItems || 0),
      outOfStock: Number(row.outOfStock || 0),
      inventoryValue: Number(row.inventoryValue || 0),
    })
  } catch (err) {
    next(err)
  }
})

router.patch('/items/:productId', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const productId = req.params.productId
    const { stock, delta } = req.body || {}

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      let nextStock = null
      if (Number.isFinite(Number(stock))) {
        nextStock = Number(stock)
      } else if (Number.isFinite(Number(delta))) {
        const [curRows] = await conn.query('SELECT stock FROM inventory_items WHERE product_id = ? LIMIT 1', [productId])
        const cur = curRows[0]?.stock
        if (!cur && cur !== 0) return res.status(404).json({ message: 'Product not found in inventory' })
        nextStock = Number(cur) + Number(delta)
      } else {
        return res.status(400).json({ message: 'Provide stock or delta' })
      }

      if (nextStock < 0) return res.status(400).json({ message: 'Stock cannot be negative' })

      const [result] = await conn.query(
        'UPDATE inventory_items SET stock = ? WHERE product_id = ?',
        [nextStock, productId]
      )
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found in inventory' })

      await conn.commit()
      res.json({ ok: true, id: productId, stock: nextStock })
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router

