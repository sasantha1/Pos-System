import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Reports.css';

const Reports = () => {
  const [salesReport, setSalesReport] = useState(null);
  const [productReport, setProductReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReports();
    }
  }, [startDate, endDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesRes, productsRes] = await Promise.all([
        api.get('/reports/sales', { params: { startDate, endDate } }),
        api.get('/reports/products', { params: { startDate, endDate } })
      ]);
      setSalesReport(salesRes.data);
      setProductReport(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <div className="date-filters">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {salesReport && (
        <div className="report-section">
          <h2>Sales Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Sales</h3>
              <p>${salesReport.summary?.totalSales.toFixed(2) || '0.00'}</p>
            </div>
            <div className="summary-card">
              <h3>Transactions</h3>
              <p>{salesReport.summary?.totalTransactions || 0}</p>
            </div>
            <div className="summary-card">
              <h3>Average Transaction</h3>
              <p>${salesReport.summary?.averageTransaction.toFixed(2) || '0.00'}</p>
            </div>
            <div className="summary-card">
              <h3>Total Tax</h3>
              <p>${salesReport.summary?.totalTax.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      )}

      {productReport && (
        <div className="report-section">
          <h2>Top Selling Products</h2>
          <div className="products-report">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {productReport.products?.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td>{item.product?.name || 'N/A'}</td>
                    <td>{item.quantity}</td>
                    <td>${item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

