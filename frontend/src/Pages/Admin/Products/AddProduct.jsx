import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    countInStock: '',
    image: '',
    isDiscount: false,
    discountPrice: '',
    discountEndDate: '',
    isFlash: false,
    flashEndDate: '',
    flashDiscountRate: '',
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (userInfo && userInfo.token) {
      fetchCategories();
    }
  }, [userInfo]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data } = await axiosInstance.get('/api/admin/categories');
      setCategories(data || []);
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
      toast.error('Kategoriler yüklenirken bir hata oluştu');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error('Lütfen bir kategori seçin');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        countInStock: parseInt(formData.countInStock),
        isDiscount: Boolean(formData.isDiscount),
        discountPrice: formData.isDiscount ? parseFloat(formData.discountPrice) : 0,
        discountEndDate: formData.isDiscount ? formData.discountEndDate : null,
        isFlash: Boolean(formData.isFlash),
        flashEndDate: formData.isFlash ? formData.flashEndDate : null,
        flashDiscountRate: formData.isFlash ? parseFloat(formData.flashDiscountRate) : 0,
      };

      const { data } = await axiosInstance.post('/api/products', submitData);
      toast.success('Ürün başarıyla eklendi');
      navigate('/admin/products');
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      toast.error(error.response?.data?.message || 'Ürün eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) {
    return <div className="text-center py-4">Lütfen giriş yapın</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Ürün Ekle</h1>
        <button
          onClick={() => navigate('/admin/products')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Geri Dön
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol Kolon */}
          <div className="space-y-6">
            {/* Ürün Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Adı
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ürün adını girin"
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ürün açıklamasını girin"
              />
            </div>

            {/* Fiyat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat (₺)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Stok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stok Adedi
              </label>
              <input
                type="number"
                name="countInStock"
                value={formData.countInStock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              {loadingCategories ? (
                <div className="w-full px-4 py-2 border rounded-lg bg-gray-50">
                  Kategoriler yükleniyor...
                </div>
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Sağ Kolon */}
          <div className="space-y-6">
            {/* Ürün Görseli */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Görseli
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Resim Yükle</span>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF max 10MB</p>
                </div>
              </div>
            </div>

            {/* İndirim Ayarları */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDiscount"
                  checked={formData.isDiscount}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  İndirimli Ürün
                </label>
              </div>

              {formData.isDiscount && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İndirimli Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleChange}
                      required={formData.isDiscount}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İndirim Bitiş Tarihi
                    </label>
                    <input
                      type="datetime-local"
                      name="discountEndDate"
                      value={formData.discountEndDate}
                      onChange={handleChange}
                      required={formData.isDiscount}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Flash Sale Ayarları */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFlash"
                  checked={formData.isFlash}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Flash Sale Ürünü
                </label>
              </div>

              {formData.isFlash && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İndirim Oranı (%)
                    </label>
                    <input
                      type="number"
                      name="flashDiscountRate"
                      value={formData.flashDiscountRate}
                      onChange={handleChange}
                      required={formData.isFlash}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flash Sale Bitiş Tarihi
                    </label>
                    <input
                      type="datetime-local"
                      name="flashEndDate"
                      value={formData.flashEndDate}
                      onChange={handleChange}
                      required={formData.isFlash}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Ekleniyor...' : 'Ürün Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;