const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { auth } = require('../middleware/auth');
const moment = require('moment');

// Generate invoice number
const generateInvoiceNumber = () => {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { items, customer, discount, tax, payments, notes, isHold } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity && !isHold) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      item.price = product.sellingPrice;
      item.subtotal = (item.price * item.quantity) - (item.discount || 0);
      subtotal += item.subtotal;
    }

    const totalDiscount = discount || 0;
    const totalTax = tax || 0;
    const total = subtotal - totalDiscount + totalTax;

    // Create sale
    const sale = new Sale({
      invoiceNumber: generateInvoiceNumber(),
      items,
      customer,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total,
      payments,
      cashier: req.user.userId,
      status: isHold ? 'pending' : 'completed',
      notes,
      isHold: isHold || false
    });

    await sale.save();

    // Update inventory if not hold
    if (!isHold) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          console.error(`Product ${item.product} not found for inventory update`);
          continue;
        }
        const previousStock = product.stock;
        product.stock -= item.quantity;
        if (product.stock < 0) {
          product.stock = 0; // Prevent negative stock
        }
        await product.save();

        // Create inventory log
        await Inventory.create({
          product: item.product,
          type: 'sale',
          quantity: -item.quantity,
          previousStock,
          newStock: product.stock,
          reference: sale.invoiceNumber,
          user: req.user.userId
        });
      }
    }

    await sale.populate('items.product', 'name sku');
    await sale.populate('customer', 'name phone');
    await sale.populate('cashier', 'name');

    res.status(201).json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sales
// @desc    Get all sales
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate('items.product', 'name sku')
      .populate('customer', 'name phone')
      .populate('cashier', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sales/:id
// @desc    Get sale by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.product')
      .populate('customer')
      .populate('cashier', 'name');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/sales/:id/refund
// @desc    Process refund
// @access  Private
router.post('/:id/refund', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    if (sale.status === 'refunded') {
      return res.status(400).json({ message: 'Sale has already been refunded' });
    }

    sale.status = 'refunded';
    await sale.save();

    // Restore inventory
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        console.error(`Product ${item.product} not found for refund`);
        continue;
      }
      const previousStock = product.stock;
      product.stock += item.quantity;
      await product.save();

      await Inventory.create({
        product: item.product,
        type: 'return',
        quantity: item.quantity,
        previousStock,
        newStock: product.stock,
        reference: `REFUND-${sale.invoiceNumber}`,
        user: req.user.userId
      });
    }

    res.json({ message: 'Refund processed successfully', sale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

