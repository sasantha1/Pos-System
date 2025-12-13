# Modern POS System

A comprehensive Point of Sale (POS) system built with React, Express.js, and MongoDB. Features an attractive, modern UI/UX design with all essential POS functionality.

## 🚀 Features

### Core POS Features
- ✅ User-friendly billing/checkout screen
- ✅ Fast product search (by name, barcode, category)
- ✅ Barcode scanner support
- ✅ Multiple item purchase in one transaction
- ✅ Automatic tax (VAT/GST) calculation
- ✅ Discount handling (item-wise & bill-wise)
- ✅ Multiple payment methods (Cash, Card, Mobile, Split)
- ✅ Invoice/receipt generation
- ✅ Refunds and returns handling

### Product Management
- ✅ Add/update/delete products
- ✅ Product categories & subcategories
- ✅ SKU & barcode management
- ✅ Product images support
- ✅ Cost price & selling price tracking
- ✅ Stock quantity per product
- ✅ Low-stock alerts
- ✅ Bulk product import/export ready

### Inventory Management
- ✅ Real-time stock updates after each sale
- ✅ Stock adjustment (damaged, lost, returned items)
- ✅ Supplier-wise inventory tracking
- ✅ Stock history & movement logs
- ✅ Expiry date tracking

### User & Role Management
- ✅ Secure login & authentication
- ✅ Role-based access control (Admin, Manager, Cashier)
- ✅ User activity logs
- ✅ Password encryption
- ✅ Session management

### Customer Management
- ✅ Customer registration
- ✅ Customer purchase history
- ✅ Loyalty points/rewards system ready
- ✅ Credit customers & due payments
- ✅ Customer contact details management

### Sales & Billing Features
- ✅ Daily, weekly, monthly sales reports
- ✅ Invoice history
- ✅ Hold & resume bills
- ✅ Price override (with permission)
- ✅ Order notes & special instructions

### Reporting & Analytics
- ✅ Sales summary reports
- ✅ Product-wise sales reports
- ✅ Category-wise performance
- ✅ Profit & loss reports
- ✅ Tax reports
- ✅ Export reports ready

### System Features
- ✅ MVC architecture
- ✅ Secure database integration
- ✅ Responsive UI (desktop/tablet/mobile)
- ✅ API support for integrations
- ✅ Modern, attractive UI/UX design

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

### 1. Clone or navigate to the project directory

```bash
cd "pos system"
```

### 2. Install dependencies for all projects

```bash
npm run install-all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Set up environment variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos-system
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### 4. Set up MongoDB Database

**Option A: Local MongoDB**
- Install MongoDB on your system (see `DATABASE_SETUP.md` for detailed instructions)
- Make sure MongoDB service is running
- Default connection: `mongodb://localhost:27017/pos-system`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get your connection string
- Update `MONGODB_URI` in `.env` with your Atlas connection string

**Note:** MongoDB will automatically create the database when you first connect. See `DATABASE_SETUP.md` for complete setup instructions.

### 5. Create Admin User

Create the first admin user:

```bash
cd server
npm run create-admin
```

This creates:
- Email: `admin@pos.com`
- Password: `admin123`

### 6. (Optional) Create Sample Data

To populate the database with sample products and categories:

```bash
cd server
npm run create-sample-data
```

### 7. Run the application

#### Option 1: Run both server and client together
```bash
npm run dev
```

#### Option 2: Run separately

**Note:** Make sure MongoDB is running before starting the server!

Terminal 1 (Server):
```bash
cd server
npm run dev
```

Terminal 2 (Client):
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👤 Default Login

After starting the application, create the first admin user using the provided script:

```bash
cd server
npm run create-admin
```

This will create an admin user with:
- **Email:** admin@pos.com
- **Password:** admin123

**Note:** Make sure MongoDB is running before executing this command.

Alternatively, you can manually create a user in MongoDB or use the registration API endpoint.

## 📁 Project Structure

```
pos-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── index.js           # Server entry point
│   └── package.json
└── package.json           # Root package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create new sale
- `POST /api/sales/:id/refund` - Process refund

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer

### Reports
- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/products` - Get product sales report
- `GET /api/reports/low-stock` - Get low stock products

### Inventory
- `GET /api/inventory` - Get inventory history
- `POST /api/inventory/adjust` - Adjust inventory

## 🎨 UI/UX Features

- Modern gradient design
- Responsive layout (works on desktop, tablet, mobile)
- Smooth animations and transitions
- Intuitive navigation
- Real-time updates
- Toast notifications
- Modal dialogs
- Beautiful charts and graphs
- Clean, professional interface

## 🔒 Security Features

- JWT-based authentication
- Password encryption (bcrypt)
- Role-based access control
- Secure API endpoints
- Input validation
- CORS configuration

## 🚧 Future Enhancements

- Multi-store/branch management
- Cloud-based deployment
- Offline mode with sync
- Email/SMS receipts
- Advanced promotions & offers
- Multi-currency support
- Language localization
- Hardware integration (receipt printer, cash drawer, etc.)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, please open an issue in the repository.

---

Built with ❤️ using React, Express.js, and MongoDB

