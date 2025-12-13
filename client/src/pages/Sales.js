import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiSearch, FiEye, FiRefreshCw } from 'react-icons/fi';
import './Sales.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate]);

  const fetchSales = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/sales', { params });
      setSales(response.data.sales || []);
    } catch (error) {
      console.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading sales...</div>;
  }

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>Sales History</h1>
        <div className="date-filters">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
          />
          <button className="btn-secondary" onClick={fetchSales}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale._id}>
                <td>{sale.invoiceNumber}</td>
                <td>{new Date(sale.createdAt).toLocaleString()}</td>
                <td>{sale.customer?.name || 'Walk-in'}</td>
                <td>{sale.items.length}</td>
                <td>${sale.subtotal.toFixed(2)}</td>
                <td>${sale.tax.toFixed(2)}</td>
                <td className="total-amount">${sale.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${sale.status}`}>
                    {sale.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => setSelectedSale(sale)}
                  >
                    <FiEye /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSale && (
        <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
          <div className="modal-content sale-details" onClick={(e) => e.stopPropagation()}>
            <h2>Sale Details - {selectedSale.invoiceNumber}</h2>
            <div className="sale-info">
              <p><strong>Date:</strong> {new Date(selectedSale.createdAt).toLocaleString()}</p>
              <p><strong>Cashier:</strong> {selectedSale.cashier?.name}</p>
              {selectedSale.customer && (
                <p><strong>Customer:</strong> {selectedSale.customer.name}</p>
              )}
            </div>
            <div className="sale-items">
              <h3>Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.name || 'N/A'}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sale-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${selectedSale.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Discount:</span>
                <span>-${selectedSale.discount.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>${selectedSale.tax.toFixed(2)}</span>
              </div>
              <div className="total-row final">
                <span>Total:</span>
                <span>${selectedSale.total.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn-secondary" onClick={() => setSelectedSale(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;

