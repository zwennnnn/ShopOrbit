import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaFilter } from 'react-icons/fa';
import axiosInstance from '../../utils/axios';
import Loader from '../../Components/Loader';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const ProductList = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';

  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price-asc');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          axiosInstance.get('/api/products'),
          axiosInstance.get('/api/products/categories/top')
        ]);

        if (productsRes.data && Array.isArray(productsRes.data)) {
          setProducts(productsRes.data);
          // Extract unique brands
          const uniqueBrands = [...new Set(productsRes.data
            .map(product => product.brand)
            .filter(Boolean))];
          setBrands(uniqueBrands);
        } else {
          console.error('Invalid products data:', productsRes.data);
          setProducts([]);
        }

        if (categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        toast.error('Ürünler yüklenirken bir hata oluştu');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      toast.success('Ürün sepete eklendi');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ürün sepete eklenirken bir hata oluştu');
    }
  };

  const filteredProducts = products
    .filter(product => {
      if (!product) return false;
      const price = product.isDiscount ? product.discountPrice : product.price;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesCategory = !selectedCategory || 
        (product.category && product.category._id === selectedCategory);
      return matchesPrice && matchesBrand && matchesCategory;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaFilter className="mr-2" /> Filtreler
            </h3>
            
            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Kategoriler</h4>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Fiyat Aralığı</h4>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-24 p-2 border rounded"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-24 p-2 border rounded"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Markalar</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands(prev => [...prev, brand]);
                          } else {
                            setSelectedBrands(prev => prev.filter(b => b !== brand));
                          }
                        }}
                        className="mr-2"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort Controls */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {selectedCategory ? categories.find(c => c._id === selectedCategory)?.name || 'Ürünler' : 'Tüm Ürünler'}
              <span className="text-gray-500 text-lg ml-2">
                ({filteredProducts.length} ürün)
              </span>
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
              <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
              <option value="name-asc">İsim (A-Z)</option>
              <option value="name-desc">İsim (Z-A)</option>
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Ürün bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                    {product.isDiscount && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg">
                        {((1 - product.discountPrice / product.price) * 100).toFixed(0)}% İndirim
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 truncate">{product.name}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      {product.brand}
                      {product.category && (
                        <span className="ml-2 text-gray-400">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.isDiscount ? (
                          <>
                            <span className="text-gray-400 line-through">₺{product.price}</span>
                            <span className="text-red-500 font-bold ml-2">₺{product.discountPrice}</span>
                          </>
                        ) : (
                          <span className="text-gray-800 font-bold">₺{product.price}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <FaShoppingCart />
                        </button>
                        <Link
                          to={`/product/${product._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          İncele
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
