const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-system');
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@pos.com';
    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('❌ Admin user not found');
      console.log('💡 Run: npm run create-admin to create the admin user');
      process.exit(1);
    }

    // Set the password to plain text - the pre-save hook will hash it
    admin.password = 'admin123';
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log('📧 Email: admin@pos.com');
    console.log('🔑 Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword();

