import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';
import { FaBox, FaTruck, FaCheck, FaClock } from 'react-icons/fa';

const OrderStatusIcon = ({ status }) => {
  switch (status) {
    case 'Beklemede':
      return <FaClock className="text-yellow-500" />;
    case 'İşleniyor':
      return <FaBox className="text-blue-500" />;
    case 'Kargoda':
      return <FaTruck className="text-purple-500" />;
    case 'Tamamlandı':
      return <FaCheck className="text-green-500" />;
    default:
      return null;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/api/orders/myorders');
      setOrders(data);
    } catch (error) {
      toast.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Henüz hiç siparişiniz bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Sipariş #{order._id.slice(-6)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <OrderStatusIcon status={order.status} />
                    <span className={`text-sm font-medium ${
                      order.status === 'Tamamlandı'
                        ? 'text-green-600'
                        : order.status === 'Kargoda'
                        ? 'text-purple-600'
                        : order.status === 'İşleniyor'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center space-x-4 border-b pb-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.qty} adet x ₺{item.price}
                        </p>
                      </div>
                      <span className="font-medium">
                        ₺{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Teslimat Adresi:</p>
                      <p className="text-sm">
                        {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                        {order.shippingAddress.postalCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Toplam Tutar:</p>
                      <p className="text-lg font-bold">₺{order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {order.status === 'Kargoda' && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600">
                        Tahmini Teslimat: {new Date(order.createdAt).getTime() + (3 * 24 * 60 * 60 * 1000)}
                      </p>
                      <p className="text-xs text-purple-500 mt-1">
                        Kargo Takip No: {order.trackingNumber || 'Henüz atanmadı'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
