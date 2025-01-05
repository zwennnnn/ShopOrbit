import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaHeart, FaShare, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../Components/Loader';
import CountdownTimer from '../Components/CountdownTimer';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        toast.error('Ürün yüklenirken bir hata oluştu');
        console.error('Ürün detayı getirme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!userInfo) {
      toast.warning('Sepete eklemek için giriş yapmalısınız');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await axiosInstance.post(`/api/products/${id}/add-to-cart`, { quantity });
      toast.success('Ürün sepete eklendi');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sepete eklenirken bir hata oluştu');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div>Ürün bulunamadı</div>;

  const currentPrice = product.isDiscount ? product.discountPrice : 
                      product.isFlash ? product.price * (1 - product.flashDiscountRate / 100) : 
                      product.price;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Ürün Görseli */}
            <div className="relative">
              <motion.img
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                src={product.image}
                alt={product.name}
                className="w-full h-[500px] object-cover rounded-lg"
              />
              {(product.isDiscount || product.isFlash) && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full">
                  {product.isFlash ? `${product.flashDiscountRate}% İndirim` : 
                   `${((product.price - product.discountPrice) / product.price * 100).toFixed(0)}% İndirim`}
                </div>
              )}
            </div>

            {/* Ürün Bilgileri */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link 
                  to={`/category/${product.category.name}`}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  {product.category.name}
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mt-2">{product.name}</h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ₺{currentPrice.toFixed(2)}
                  </span>
                  {(product.isDiscount || product.isFlash) && (
                    <span className="text-xl text-gray-400 line-through">
                      ₺{product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {(product.isDiscount || product.isFlash) && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">İndirim Bitiş Tarihi:</p>
                    <CountdownTimer 
                      endDate={product.isFlash ? product.flashEndDate : product.discountEndDate} 
                    />
                  </div>
                )}

                <p className="text-gray-600">{product.description}</p>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                      className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Stok: {product.countInStock}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.countInStock === 0}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-8 rounded-lg text-white font-semibold transition-all duration-300 ${
                    product.countInStock === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {addingToCart ? (
                    <Loader small />
                  ) : (
                    <>
                      <FaShoppingCart />
                      <span>
                        {product.countInStock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex space-x-4">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FaHeart className="text-red-500" />
                    <span>Favorilere Ekle</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FaShare className="text-blue-500" />
                    <span>Paylaş</span>
                  </button>
                </div>
              </motion.div>

              {/* Ürün Özellikleri */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="border-t pt-6 space-y-4"
              >
                <h3 className="text-lg font-semibold">Öne Çıkan Özellikler</h3>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-green-500" />
                    <span>Hızlı Kargo</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-green-500" />
                    <span>Güvenli Alışveriş</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-green-500" />
                    <span>Kolay İade</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
