import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../utils/axios';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Loader from '../../../Components/Loader';
import Pagination from '../../../Components/Pagination';

const Products = () => {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    discounted: 0,
    flashSale: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    if (userInfo) {
      loadData();
    }
  }, [userInfo, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Paralel veri yükleme
      const [productsResponse, statsResponse] = await Promise.all([
        axiosInstance.get(`/api/admin/products?page=${currentPage}&limit=${limit}`),
        axiosInstance.get('/api/admin/products/stats')
      ]);

      setProducts(productsResponse.data.products);
      setTotalPages(productsResponse.data.pages);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setError('Veriler yüklenirken bir hata oluştu');
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/admin/products/${id}`);
      toast.success('Ürün başarıyla silindi');
      loadData(); // Sadece mevcut sayfayı yenile
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      toast.error('Ürün silinirken bir hata oluştu');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // useEffect tetiklenecek ve yeni sayfa yüklenecek
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={loadData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  if (!userInfo) {
    return <div className="text-center py-4">Lütfen giriş yapın</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Üst Bilgi Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Toplam Ürün</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Stokta Olmayan</h3>
          <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">İndirimli Ürünler</h3>
          <p className="text-2xl font-bold text-green-600">{stats.discounted}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Flash Sale</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.flashSale}</p>
        </div>
      </div>

      {/* Ürün Ekleme Butonu */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Ürün Listesi</h2>
        <Link
          to="/admin/products/add"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <FaPlus /> Yeni Ürün
        </Link>
      </div>

      {/* Ürün Listesi */}
      {products.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">Henüz ürün bulunmuyor</p>
          <Link
            to="/admin/products/add"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-2" /> İlk ürünü ekle
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.image}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.category?.name || 'Kategorisiz'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.isDiscount ? (
                        <div>
                          <span className="line-through text-gray-500">
                            ₺{product.price}
                          </span>
                          <span className="ml-2 text-red-600">
                            ₺{product.discountPrice}
                          </span>
                        </div>
                      ) : (
                        <span>₺{product.price}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.countInStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {product.countInStock === 0 && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Stokta Yok
                        </span>
                      )}
                      {product.isDiscount && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          İndirimli
                        </span>
                      )}
                      {product.isFlash && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Flash
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEdit className="inline" />
                    </Link>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Products;