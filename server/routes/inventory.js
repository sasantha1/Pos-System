const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/inventory
// @desc    Get inventory history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { product, type, page = 1, limit = 50 } = req.query;
    const query = {};

    if (product) query.product = product;
    if (type) query.type = type;

    const inventory = await Inventory.find(query)
      .populate('product', 'name sku')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Inventory.countDocuments(query);

    res.json({
      inventory,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory/adjust
// @desc    Adjust inventory
// @access  Private (Manager, Admin)
router.post('/adjust', [auth, authorize('admin', 'manager')], async (req, res) => {
  try {
    const { product, quantity, type, notes } = req.body;

    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousStock = productDoc.stock;
    const adjustment = type === 'add' ? quantity : -quantity;
    productDoc.stock += adjustment;

    if (productDoc.stock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    await productDoc.save();

    const inventory = await Inventory.create({
      product,
      type: type === 'add' ? 'adjustment' : 'adjustment',
      quantity: adjustment,
      previousStock,
      newStock: productDoc.stock,
      user: req.user.userId,
      notes
    });

    await inventory.populate('product', 'name sku');
    res.status(201).json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

