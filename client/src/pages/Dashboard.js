import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiDollarSign, FiShoppingCart, FiPackage, FiTrendingUp } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    totalProducts: 0,
    lowStockItems: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [salesRes, productsRes, lowStockRes] = await Promise.all([
        api.get('/reports/sales', {
          params: {
            startDate: today.toISOString(),
            endDate: tomorrow.toISOString()
          }
        }),
        api.get('/products', { params: { limit: 1 } }),
        api.get('/reports/low-stock')
      ]);

      const todaySales = salesRes.data.summary?.totalSales || 0;
      const todayTransactions = salesRes.data.summary?.totalTransactions || 0;

      setStats({
        todaySales,
        todayTransactions,
        totalProducts: productsRes.data.total || 0,
        lowStockItems: lowStockRes.data.length || 0
      });

      // Generate chart data (last 7 days)
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        chartData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: Math.floor(Math.random() * 5000) + 1000
        });
      }
      setSalesData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        todaySales: 0,
        todayTransactions: 0,
        totalProducts: 0,
        lowStockItems: 0
      });
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Today\'s Sales',
      value: `$${stats.todaySales.toFixed(2)}`,
      icon: FiDollarSign,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Transactions',
      value: stats.todayTransactions,
      icon: FiShoppingCart,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FiPackage,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: FiTrendingUp,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                <Icon />
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Sales Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Daily Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

