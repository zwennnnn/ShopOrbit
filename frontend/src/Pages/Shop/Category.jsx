import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaFilter } from 'react-icons/fa';
import axiosInstance from '../../utils/axios';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import Loader from '../../Components/Loader';
import { Link } from 'react-router-dom';

const Category = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const { addToCart } = useCart();
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    page: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ minPrice: 0, maxPrice: 0 });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/api/products/categories/top');
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      toast.error('Kategoriler yüklenirken bir hata oluştu');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const { data } = await axiosInstance.get(`/api/products/all?${queryParams}`);
      setProducts(data.products);
      setPagination(data.pagination);
      
      // Update filter options
      if (data.filterOptions) {
        setPriceRange(data.filterOptions.priceRange);
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      toast.error('Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      toast.success('Ürün sepete eklendi');
    } catch (error) {
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt',
      page: 1
    });
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'page' || key === 'sort') return false;
      return value !== '';
    }).length;
  };

  if (loading && !products.length) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaFilter />
            <span>Filtrele {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}</span>
          </button>
          
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Fiyat</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  min={priceRange.minPrice}
                  max={priceRange.maxPrice}
                  placeholder={`Min: ₺${priceRange.minPrice}`}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Fiyat</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  min={priceRange.minPrice}
                  max={priceRange.maxPrice}
                  placeholder={`Max: ₺${priceRange.maxPrice}`}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Sıralama</label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="-createdAt">En Yeniler</option>
                  <option value="price">Fiyat (Düşükten Yükseğe)</option>
                  <option value="-price">Fiyat (Yüksekten Düşüğe)</option>
                  <option value="name">İsim (A-Z)</option>
                  <option value="-name">İsim (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link to={`/product/${product._id}`} className="block">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                {product.discountPrice && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg">
                    {((1 - product.discountPrice / product.price) * 100).toFixed(0)}% İndirim
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 truncate">{product.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    {product.discountPrice ? (
                      <>
                        <span className="text-gray-400 line-through">₺{product.price}</span>
                        <span className="text-red-500 font-bold ml-2">₺{product.discountPrice}</span>
                      </>
                    ) : (
                      <span className="text-gray-800 font-bold">₺{product.price}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product._id);
                    }}
                    disabled={product.countInStock === 0}
                    className={`p-2 text-white rounded-full transition-colors ${
                      product.countInStock > 0 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FaShoppingCart />
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-8 flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Önceki
          </button>
          <span className="px-4 py-2 border rounded-md bg-blue-50">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
};

export default Category;
