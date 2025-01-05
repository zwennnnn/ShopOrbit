import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFilter, FaSortAmountDown } from 'react-icons/fa';
import axiosInstance from '../utils/axios';
import Loader from '../Components/Loader';

const ProductList = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price-asc');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/products/category/${categoryName}`);
        setProducts(data);
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  const sortedProducts = [...products].sort((a, b) => {
    const aPrice = a.isDiscount ? a.discountPrice : a.price;
    const bPrice = b.isDiscount ? b.discountPrice : b.price;

    switch (sortBy) {
      case 'price-asc':
        return aPrice - bPrice;
      case 'price-desc':
        return bPrice - aPrice;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{categoryName}</h1>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {products.length} ürün bulundu
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                  <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                  <option value="name-asc">İsim (A-Z)</option>
                  <option value="name-desc">İsim (Z-A)</option>
                </select>
                <FaSortAmountDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <Link to={`/product/${product._id}`}>
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.isDiscount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                        %{((product.price - product.discountPrice) / product.price * 100).toFixed(0)} İndirim
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-bold text-gray-900">
                        ₺{(product.isDiscount ? product.discountPrice : product.price).toFixed(2)}
                      </span>
                      {product.isDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          ₺{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
