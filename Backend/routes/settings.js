const router = require('express').Router()

const { getPool } = require('../db')
const { optionalAuth } = require('../middleware/auth')

const DEFAULTS = {
  business: {
    name: 'QuickPOS',
    address: '',
    phone: '',
    email: '',
  },
  systemPrefs: {
    soundEffects: true,
    lowStockAlerts: true,
    loyaltyProgram: true,
  },
  tax: {
    defaultTaxRate: 8.5,
    appliedTaxRate: 8.5,
  },
  receipts: {
    printReceipts: true,
    emailReceipts: false,
    receiptHeaderText: 'Thank you for shopping with us!',
    receiptFooterText: 'Please come again!',
  },
  hardware: {
    receiptPrinter: false,
    barcodeScanner: true,
    cardReader: false,
  },
  security: {
    requirePin: true,
    autoLogout: false,
  },
}

function safeValue(value) {
  // mysql2 should return JSON as object when possible; but guard for string.
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const keys = Object.keys(DEFAULTS)
    const [rows] = await pool.query(
      `SELECT \`key\`, value FROM settings_kv WHERE \`key\` IN (${keys.map(() => '?').join(',')})`,
      keys
    )

    const out = { ...DEFAULTS }
    for (const r of rows) {
      const parsed = safeValue(r.value)
      if (parsed) out[r.key] = parsed
    }
    res.json(out)
  } catch (err) {
    next(err)
  }
})

router.put('/', optionalAuth, async (req, res, next) => {
  try {
    const pool = getPool()
    const body = req.body || {}

    const toUpsert = {
      business: body.business || DEFAULTS.business,
      systemPrefs: body.systemPrefs || DEFAULTS.systemPrefs,
      tax: body.tax || DEFAULTS.tax,
      receipts: body.receipts || DEFAULTS.receipts,
      hardware: body.hardware || DEFAULTS.hardware,
      security: body.security || DEFAULTS.security,
    }

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      for (const key of Object.keys(toUpsert)) {
        const value = toUpsert[key]
        await conn.query(
          `
            INSERT INTO settings_kv (\`key\`, \`value\`)
            VALUES (?, CAST(? AS JSON))
            ON DUPLICATE KEY UPDATE \`value\` = CAST(? AS JSON)
          `,
          [key, JSON.stringify(value), JSON.stringify(value)]
        )
      }
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router

