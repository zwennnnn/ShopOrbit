import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, loading, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!userInfo) {
        navigate('/login');
      } else {
        setFormData({
          name: userInfo.name || '',
          email: userInfo.email || '',
          password: '',
          confirmPassword: '',
          avatar: userInfo.avatar || '',
        });
        setPageLoading(false);
      }
    }
  }, [userInfo, loading, navigate]);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        'http://localhost:5000/api/users/profile',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          avatar: formData.avatar,
        },
        config
      );

      login(data);
      toast.success('Profil güncellendi!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Güncelleme başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/users/upload-avatar',
        formData,
        config
      );

      setFormData(prev => ({
        ...prev,
        avatar: data.avatar
      }));

      // Kullanıcı bilgilerini güncelle
      login({
        ...userInfo,
        avatar: data.avatar
      });

      toast.success('Avatar başarıyla güncellendi!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Avatar yükleme başarısız!');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-2xl font-bold mb-6">Profil Ayarları</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Önizleme - Güncellendi */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                {uploadingAvatar ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                )}
              </label>
            </div>
          </div>

          {/* Form Alanları */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Değiştirmek istemiyorsanız boş bırakın"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Değiştirmek istemiyorsanız boş bırakın"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
