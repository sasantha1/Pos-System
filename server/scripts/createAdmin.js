const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://<pos-system>:<admin123>@cluster0.mj8iy.mongodb.net/');
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@pos.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'Admin',
      email: adminEmail,
      password: 'admin123', // Let the User model's pre-save hook hash this
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@pos.com');
    console.log('🔑 Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

