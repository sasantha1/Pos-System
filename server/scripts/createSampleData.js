const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
require('dotenv').config();

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-system');
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Category.deleteMany({});
    // await Product.deleteMany({});
    // await Supplier.deleteMany({});

    // Create Suppliers
    console.log('📦 Creating suppliers...');
    const supplier1 = await Supplier.create({
      name: 'Tech Supplies Inc.',
      contactPerson: 'John Doe',
      email: 'john@techsupplies.com',
      phone: '+1-555-0101',
      address: {
        street: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA'
      }
    });

    const supplier2 = await Supplier.create({
      name: 'Global Electronics',
      contactPerson: 'Jane Smith',
      email: 'jane@globalelec.com',
      phone: '+1-555-0102',
      address: {
        street: '456 Electronics Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
    });

    console.log('✅ Suppliers created');

    // Create Categories
    console.log('📁 Creating categories...');
    const electronics = await Category.create({
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      isActive: true
    });

    const clothing = await Category.create({
      name: 'Clothing',
      description: 'Apparel and fashion items',
      isActive: true
    });

    const food = await Category.create({
      name: 'Food & Beverages',
      description: 'Food and drink products',
      isActive: true
    });

    const office = await Category.create({
      name: 'Office Supplies',
      description: 'Office equipment and supplies',
      isActive: true
    });

    console.log('✅ Categories created');

    // Create Products
    console.log('🛍️ Creating products...');
    
    const products = [
      // Electronics
      {
        name: 'Wireless Mouse',
        sku: 'ELEC-001',
        barcode: '1234567890123',
        category: electronics._id,
        costPrice: 5.00,
        sellingPrice: 15.99,
        stock: 50,
        lowStockThreshold: 10,
        unit: 'pcs',
        supplier: supplier1._id,
        description: 'Ergonomic wireless mouse with 2.4GHz connection'
      },
      {
        name: 'USB Keyboard',
        sku: 'ELEC-002',
        barcode: '1234567890124',
        category: electronics._id,
        costPrice: 8.00,
        sellingPrice: 25.99,
        stock: 30,
        lowStockThreshold: 10,
        unit: 'pcs',
        supplier: supplier1._id,
        description: 'Mechanical keyboard with RGB lighting'
      },
      {
        name: 'USB-C Cable',
        sku: 'ELEC-003',
        barcode: '1234567890125',
        category: electronics._id,
        costPrice: 2.50,
        sellingPrice: 9.99,
        stock: 100,
        lowStockThreshold: 20,
        unit: 'pcs',
        supplier: supplier2._id,
        description: 'High-speed USB-C charging cable, 6ft'
      },
      {
        name: 'Bluetooth Speaker',
        sku: 'ELEC-004',
        barcode: '1234567890126',
        category: electronics._id,
        costPrice: 25.00,
        sellingPrice: 59.99,
        stock: 15,
        lowStockThreshold: 5,
        unit: 'pcs',
        supplier: supplier2._id,
        description: 'Portable Bluetooth speaker with 360° sound'
      },
      
      // Clothing
      {
        name: 'Cotton T-Shirt',
        sku: 'CLOTH-001',
        barcode: '1234567890127',
        category: clothing._id,
        costPrice: 8.00,
        sellingPrice: 24.99,
        stock: 75,
        lowStockThreshold: 15,
        unit: 'pcs',
        description: '100% cotton t-shirt, various sizes available'
      },
      {
        name: 'Denim Jeans',
        sku: 'CLOTH-002',
        barcode: '1234567890128',
        category: clothing._id,
        costPrice: 20.00,
        sellingPrice: 49.99,
        stock: 40,
        lowStockThreshold: 10,
        unit: 'pcs',
        description: 'Classic fit denim jeans'
      },
      
      // Food & Beverages
      {
        name: 'Bottled Water',
        sku: 'FOOD-001',
        barcode: '1234567890129',
        category: food._id,
        costPrice: 0.50,
        sellingPrice: 1.99,
        stock: 200,
        lowStockThreshold: 50,
        unit: 'bottles',
        description: '500ml purified water'
      },
      {
        name: 'Energy Drink',
        sku: 'FOOD-002',
        barcode: '1234567890130',
        category: food._id,
        costPrice: 1.50,
        sellingPrice: 3.99,
        stock: 80,
        lowStockThreshold: 20,
        unit: 'cans',
        description: '250ml energy drink'
      },
      
      // Office Supplies
      {
        name: 'Notebook',
        sku: 'OFFICE-001',
        barcode: '1234567890131',
        category: office._id,
        costPrice: 2.00,
        sellingPrice: 5.99,
        stock: 60,
        lowStockThreshold: 15,
        unit: 'pcs',
        description: 'A5 ruled notebook, 100 pages'
      },
      {
        name: 'Ballpoint Pen',
        sku: 'OFFICE-002',
        barcode: '1234567890132',
        category: office._id,
        costPrice: 0.50,
        sellingPrice: 1.99,
        stock: 150,
        lowStockThreshold: 30,
        unit: 'pcs',
        description: 'Blue ink ballpoint pen'
      },
      {
        name: 'Stapler',
        sku: 'OFFICE-003',
        barcode: '1234567890133',
        category: office._id,
        costPrice: 5.00,
        sellingPrice: 12.99,
        stock: 25,
        lowStockThreshold: 5,
        unit: 'pcs',
        description: 'Standard office stapler'
      }
    ];

    await Product.insertMany(products);
    console.log(`✅ Created ${products.length} products`);

    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${await Supplier.countDocuments()} Suppliers`);
    console.log(`   - ${await Category.countDocuments()} Categories`);
    console.log(`   - ${await Product.countDocuments()} Products`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
};

createSampleData();

