import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getTotal } = useCart();
  const { userInfo, loading } = useAuth();

  useEffect(() => {
    if (!loading && !userInfo) {
      toast.error('Lütfen önce giriş yapın');
      navigate('/login');
    }
  }, [userInfo, loading, navigate]);

  if (loading) return null;
  if (!userInfo) return null;

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      await updateQuantity(productId, newQuantity);
      toast.success('Miktar güncellendi');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Miktar güncellenirken bir hata oluştu');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Ürün sepetten kaldırıldı');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ürün kaldırılırken bir hata oluştu');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Sepetim</h1>
            <Link
              to="/"
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Alışverişe Devam Et
            </Link>
          </div>

          {!cartItems || cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-8 text-center"
            >
              <p className="text-gray-600 mb-4">Sepetinizde ürün bulunmamaktadır.</p>
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Alışverişe Başla
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <motion.div
                  key={item.product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="ml-6 flex-grow">
                      <Link
                        to={`/product/${item.product._id}`}
                        className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <div className="mt-1 text-gray-500">
                        {item.product.brand}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus />
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            disabled={item.quantity >= item.product.countInStock}
                          >
                            <FaPlus />
                          </button>
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          ₺{((item.product.isDiscount ? item.product.discountPrice : item.product.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="ml-6 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg text-gray-600">Toplam</span>
                  <span className="text-2xl font-bold text-gray-800">
                    ₺{getTotal().toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaCreditCard className="mr-2" />
                  Ödemeye Geç
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
