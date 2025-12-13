const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const moment = require('moment');

// @route   GET /api/reports/sales
// @desc    Get sales report
// @access  Private
router.get('/sales', auth, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const start = startDate ? new Date(startDate) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate) : moment().endOf('month').toDate();

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.length, 0);
    const totalTax = sales.reduce((sum, sale) => sum + sale.tax, 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + sale.discount, 0);

    res.json({
      period: { start, end },
      summary: {
        totalSales,
        totalItems,
        totalTransactions: sales.length,
        totalTax,
        totalDiscount,
        averageTransaction: sales.length > 0 ? totalSales / sales.length : 0
      },
      sales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/products
// @desc    Get product sales report
// @access  Private
router.get('/products', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate) : moment().endOf('month').toDate();

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).populate('items.product', 'name sku');

    const productMap = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product._id.toString();
        if (!productMap[productId]) {
          productMap[productId] = {
            product: item.product,
            quantity: 0,
            revenue: 0
          };
        }
        productMap[productId].quantity += item.quantity;
        productMap[productId].revenue += item.subtotal;
      });
    });

    const productReports = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);

    res.json({
      period: { start, end },
      products: productReports
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/low-stock', auth, async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true
    }).populate('category', 'name');

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

