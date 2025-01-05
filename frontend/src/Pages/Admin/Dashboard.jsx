import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
    },
    dailySales: [],
    recentOrders: [],
    lowStockProducts: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(
          'http://localhost:5000/api/admin/dashboard',
          config
        );
        setDashboardData(data);
      } catch (error) {
        console.error('Dashboard veri çekme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userInfo]);

  const salesData = {
    labels: dashboardData.dailySales.map(sale => sale._id),
    datasets: [
      {
        label: 'Günlük Satışlar (₺)',
        data: dashboardData.dailySales.map(sale => sale.total),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₺' + value.toLocaleString();
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-gray-500 text-sm">Toplam Satış</h3>
          <p className="text-2xl font-bold text-blue-600">
            ₺{dashboardData.stats.totalSales.toLocaleString()}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-gray-500 text-sm">Toplam Sipariş</h3>
          <p className="text-2xl font-bold text-green-600">{dashboardData.stats.totalOrders}</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-gray-500 text-sm">Toplam Ürün</h3>
          <p className="text-2xl font-bold text-purple-600">{dashboardData.stats.totalProducts}</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-gray-500 text-sm">Toplam Müşteri</h3>
          <p className="text-2xl font-bold text-orange-600">{dashboardData.stats.totalCustomers}</p>
        </motion.div>
      </div>

      {/* Grafikler Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Satış Grafiği */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Satış Grafiği</h2>
          <div className="h-[300px]">
            <Line 
              data={salesData} 
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      {/* Alt Grid - Son Siparişler ve Stok Uyarıları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son Siparişler */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Son Siparişler</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sipariş No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">#{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₺{order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' : 
                        order.status === 'İptal' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kritik Stok Uyarıları */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Kritik Stok Uyarıları</h2>
          <div className="space-y-4">
            {dashboardData.lowStockProducts.map((product) => (
              <div key={product._id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <span className="font-medium">{product.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 