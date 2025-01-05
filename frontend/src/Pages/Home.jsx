import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaBolt, FaPercent, FaFire, FaShoppingCart } from 'react-icons/fa';
import axiosInstance from '../utils/axios';
import Loader from '../Components/Loader';
import CountdownTimer from '../Components/CountdownTimer';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [flashSaleRes, discountedRes, categoriesRes] = await Promise.all([
          axiosInstance.get('/api/products/flash-sale'),
          axiosInstance.get('/api/products/discounted'),
          axiosInstance.get('/api/products/categories/top')
        ]);

        setFlashSaleProducts(flashSaleRes.data);
        setDiscountedProducts(discountedRes.data);
        setTopCategories(categoriesRes.data);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTimeLeft = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    
    const difference = midnight - now;
    
    return {
      hours: Math.floor((difference / (1000 * 60 * 60))),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      toast.success('Ürün sepete eklendi');
    } catch (error) {
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
               backgroundSize: '50px 50px',
               animation: 'grid-move 15s linear infinite'
             }}
        />

        <div className="relative h-full container mx-auto px-4">
          <div className="h-full flex flex-col items-start justify-center text-white max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 relative z-10"
            >
              <motion.h1 
                className="text-6xl md:text-7xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.span 
                  className="inline-block"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white animate-gradient-x">
                    Shop
                  </span>
                </motion.span>
                <motion.span 
                  className="inline-block ml-2"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white animate-gradient-x delay-150">
                    Orbit
                  </span>
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-xl md:text-2xl font-light text-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Alışverişin Yeni Boyutu
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/category"
                  className="group relative inline-flex items-center justify-center"
                >
                  <span className="relative px-12 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden transition-all duration-300 ease-out group-hover:scale-110 hover:shadow-xl">
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
                    <span className="relative">Alışverişe Başla</span>
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          className="absolute inset-0 opacity-40"
          animate={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59,130,246,0.3) 0%, rgba(147,51,234,0.3) 45%, rgba(236,72,153,0.3) 100%)`
          }}
          transition={{ type: "spring", damping: 10 }}
        />

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-[100px]">
            <motion.path 
              initial={{ d: "M0,64L80,80C160,96,320,128,480,128C640,128,800,96,960,80C1120,64,1280,64,1360,64L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" }}
              animate={{ d: "M0,64L80,69.3C160,75,320,85,480,90.7C640,96,800,96,960,90.7C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-red-500 to-pink-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <FaBolt className="text-3xl text-yellow-300 animate-pulse" />
              <h2 className="text-2xl font-bold text-white">Flash Sales</h2>
            </div>
            <Link to="/category" className="flex items-center text-white hover:text-yellow-300 transition-colors">
              Tümünü Gör <FaArrowRight className="ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg">
                      -{product.flashDiscountRate}%
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                      <CountdownTimer endDate={product.flashEndDate} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 truncate">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-400 line-through">₺{product.price}</span>
                        <span className="text-red-500 font-bold ml-2">
                          ₺{(product.price * (1 - product.flashDiscountRate / 100)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <FaShoppingCart />
                        </button>
                        <Link to={`/product/${product._id}`} className="text-blue-500 hover:text-blue-700">
                          İncele
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <FaFire className="text-3xl text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">Popüler Kategoriler</h2>
            </div>
          </div>
          
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {topCategories.map((category) => (
                <Link
                  key={category._id}
                  to="/category"
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex flex-col items-center justify-center transition-transform hover:scale-105"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-16 h-16 object-cover rounded-full mb-4"
                  />
                  <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.productCount} Ürün</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <FaPercent className="text-3xl text-green-500" />
              <h2 className="text-2xl font-bold text-gray-800">İndirimli Ürünler</h2>
            </div>
            <Link to="/category" className="flex items-center text-gray-600 hover:text-green-500 transition-colors">
              Tümünü Gör <FaArrowRight className="ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {discountedProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg">
                      {((1 - product.discountPrice / product.price) * 100).toFixed(0)}% İndirim
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 truncate">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-400 line-through">₺{product.price}</span>
                        <span className="text-green-500 font-bold ml-2">₺{product.discountPrice}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <FaShoppingCart />
                        </button>
                        <Link to={`/product/${product._id}`} className="text-blue-500 hover:text-blue-700">
                          İncele
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <CountdownTimer endDate={product.discountEndDate} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative z-10 -mt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[/* ... */].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-lg bg-opacity-90"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <span className="material-icons text-3xl text-blue-600">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
