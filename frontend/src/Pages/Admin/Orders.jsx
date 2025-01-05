import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';
import { FaBox, FaTruck, FaCheck, FaClock, FaUser } from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/api/orders');
      setOrders(data);
    } catch (error) {
      toast.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/api/orders/${orderId}/status`, {
        status: newStatus
      });
      toast.success('Sipariş durumu güncellendi');
      fetchOrders();
    } catch (error) {
      toast.error('Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'İşleniyor':
        return 'bg-blue-100 text-blue-800';
      case 'Kargoda':
        return 'bg-purple-100 text-purple-800';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      case 'İptal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <h1 className="text-2xl font-bold mb-8">Sipariş Yönetimi</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaUser className="text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || 'Misafir'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₺{order.totalPrice.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Beklemede">Beklemede</option>
                      <option value="İşleniyor">İşleniyor</option>
                      <option value="Kargoda">Kargoda</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                      <option value="İptal">İptal</option>
                    </select>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-900"
                    >
                      Detaylar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Sipariş Detayları #{selectedOrder._id.slice(-6)}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
                <p className="text-sm text-gray-600">
                  Ad Soyad: {selectedOrder.user?.name || 'Misafir'}
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Teslimat Adresi</h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.address}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Ürünler</h3>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.qty} adet x ₺{item.price}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        ₺{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Toplam Tutar</span>
                  <span className="font-bold text-lg">
                    ₺{selectedOrder.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
