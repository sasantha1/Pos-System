# Database Setup Guide

This guide will help you set up MongoDB for the POS System.

## Option 1: Local MongoDB Installation

### Step 1: Install MongoDB

#### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will be installed as a Windows service and start automatically

#### macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 2: Verify MongoDB is Running

Open a terminal and run:
```bash
mongosh
```

If MongoDB is running, you'll see the MongoDB shell prompt. Type `exit` to leave.

### Step 3: Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Note:** MongoDB will automatically create the database `pos-system` when you first connect to it.

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (Free tier M0 is available)

### Step 2: Configure Database Access

1. Go to **Database Access** → **Add New Database User**
2. Create a username and password
3. Set user privileges to **Read and write to any database**

### Step 3: Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. For development, click **Allow Access from Anywhere** (0.0.0.0/0)
3. For production, add only your server's IP address

### Step 4: Get Connection String

1. Go to **Clusters** → Click **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `pos-system` (or your preferred database name)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pos-system?retryWrites=true&w=majority
```

### Step 5: Update .env File

Update your `server/.env` file with the Atlas connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pos-system?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Step 4: Create Admin User

After MongoDB is set up and running, create the admin user:

```bash
cd server
npm run create-admin
```

This will create:
- **Email:** admin@pos.com
- **Password:** admin123
- **Role:** admin

## Step 5: Verify Database Connection

Start the server to verify the connection:

```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

## Step 6: Create Sample Data (Optional)

You can create sample categories and products using MongoDB Compass, MongoDB Shell, or through the application UI after logging in.

### Using MongoDB Shell:

```bash
mongosh
use pos-system
```

### Create Sample Categories:

```javascript
db.categories.insertMany([
  {
    name: "Electronics",
    description: "Electronic items",
    isActive: true,
    createdAt: new Date()
  },
  {
    name: "Clothing",
    description: "Clothing items",
    isActive: true,
    createdAt: new Date()
  },
  {
    name: "Food & Beverages",
    description: "Food and drink items",
    isActive: true,
    createdAt: new Date()
  }
])
```

### Create Sample Products:

```javascript
// First, get a category ID
const electronicsCategory = db.categories.findOne({ name: "Electronics" })

db.products.insertMany([
  {
    name: "Wireless Mouse",
    sku: "ELEC-001",
    barcode: "1234567890123",
    category: electronicsCategory._id,
    costPrice: 5.00,
    sellingPrice: 15.99,
    stock: 50,
    lowStockThreshold: 10,
    unit: "pcs",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "USB Keyboard",
    sku: "ELEC-002",
    barcode: "1234567890124",
    category: electronicsCategory._id,
    costPrice: 8.00,
    sellingPrice: 25.99,
    stock: 30,
    lowStockThreshold: 10,
    unit: "pcs",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: Authentication failed`

**Solution:** 
- Check your username and password in the connection string
- Verify database user has correct permissions

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Make sure MongoDB service is running
- Check if MongoDB is running on the correct port (default: 27017)
- Verify firewall settings

**Error:** `MongoNetworkError: failed to connect`

**Solution:**
- Check your internet connection (for Atlas)
- Verify IP address is whitelisted in Atlas Network Access
- Check connection string format

### Check MongoDB Status

**Windows:**
```bash
# Check if MongoDB service is running
sc query MongoDB
```

**macOS/Linux:**
```bash
# Check MongoDB status
sudo systemctl status mongod
# or
brew services list
```

### Reset Database (Development Only)

If you need to start fresh:

```bash
mongosh
use pos-system
db.dropDatabase()
```

Then run the admin creation script again:
```bash
cd server
npm run create-admin
```

## Database Collections

The system will automatically create these collections when you use the application:

- `users` - User accounts and authentication
- `products` - Product catalog
- `categories` - Product categories
- `sales` - Sales transactions
- `customers` - Customer information
- `inventory` - Inventory movement history
- `suppliers` - Supplier information
- `branches` - Store/branch information (optional)

## Next Steps

1. ✅ Database is set up
2. ✅ Admin user is created
3. 🎯 Start the application: `npm run dev`
4. 🎯 Login at http://localhost:3000
5. 🎯 Start adding products and making sales!

