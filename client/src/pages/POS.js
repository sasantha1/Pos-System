import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import {
  FiSearch,
  FiShoppingCart,
  FiX,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiPrinter,
  FiSave,
  FiPercent
} from 'react-icons/fi';
import './POS.css';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(10); // 10% VAT
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [barcodeInput, setBarcodeInput] = useState('');
  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (barcodeInput && barcodeInput.length >= 3) {
      const timer = setTimeout(() => {
        handleBarcodeScan(barcodeInput);
        setBarcodeInput('');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [barcodeInput]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', { params: { limit: 100 } });
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const handleBarcodeScan = async (barcode) => {
    if (!barcode || barcode.length < 3) return;
    
    try {
      const response = await api.get(`/products/barcode/${barcode}`);
      if (response.data) {
        addToCart(response.data);
      }
    } catch (error) {
      // Silently fail for barcode scan - don't show error for every keystroke
      if (error.response?.status === 404) {
        // Only show error if it's a complete barcode scan (longer barcodes)
        if (barcode.length >= 8) {
          toast.error('Product not found');
        }
      }
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }
    try {
      const response = await api.get('/products', {
        params: { search: searchTerm, limit: 50 }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Product out of stock');
      return;
    }

    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Insufficient stock');
        return;
      }
      setCart(cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        price: product.sellingPrice,
        discount: 0
      }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.product._id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        if (newQuantity > item.product.stock) {
          toast.error('Insufficient stock');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const itemTotal = (item.price * item.quantity) - (item.discount || 0);
      return sum + itemTotal;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
    return {
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: subtotal - discountAmount + taxAmount
    };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const totals = calculateTotal();
    const saleData = {
      items: cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        subtotal: (item.price * item.quantity) - (item.discount || 0)
      })),
      customer: selectedCustomer?._id,
      discount: totals.discount,
      tax: totals.tax,
      payments: [{
        method: paymentMethod,
        amount: totals.total
      }],
      notes: ''
    };

    try {
      const response = await api.post('/sales', saleData);
      toast.success('Sale completed successfully!');
      
      // Print receipt
      window.print();
      
      // Clear cart
      setCart([]);
      setDiscount(0);
      setSelectedCustomer(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    }
  };

  const totals = calculateTotal();

  return (
    <div className="pos-container">
      <div className="pos-header">
        <h1>Point of Sale</h1>
        <div className="pos-actions">
          <button className="btn-secondary" onClick={() => setCart([])}>
            <FiX /> Clear Cart
          </button>
        </div>
      </div>

      <div className="pos-layout">
        <div className="pos-left">
          <div className="search-section">
            <div className="search-box">
              <FiSearch />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <input
              ref={barcodeInputRef}
              type="text"
              className="barcode-input"
              placeholder="Scan barcode..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && barcodeInput.length >= 3) {
                  handleBarcodeScan(barcodeInput);
                  setBarcodeInput('');
                }
              }}
            />
          </div>

          <div className="products-grid">
            {products.map(product => (
              <div
                key={product._id}
                className={`product-card ${product.stock <= 0 ? 'out-of-stock' : ''}`}
                onClick={() => product.stock > 0 && addToCart(product)}
              >
                {product.image && (
                  <img src={product.image} alt={product.name} />
                )}
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-sku">{product.sku}</p>
                  <div className="product-footer">
                    <span className="product-price">${product.sellingPrice.toFixed(2)}</span>
                    <span className={`product-stock ${product.stock <= product.lowStockThreshold ? 'low' : ''}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pos-right">
          <div className="cart-section">
            <h2>Shopping Cart</h2>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">Cart is empty</div>
              ) : (
                cart.map(item => (
                  <div key={item.product._id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.product.name}</h4>
                      <p>${item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="cart-item-actions">
                      <button onClick={() => updateQuantity(item.product._id, -1)}>
                        <FiMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, 1)}>
                        <FiPlus />
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.product._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className="cart-item-total">
                      ${((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Discount ({discount}%):</span>
                <span>-${totals.discount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax ({taxRate}%):</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-controls">
              <div className="form-group">
                <label>Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile Payment</option>
                </select>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                <FiShoppingCart />
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;

