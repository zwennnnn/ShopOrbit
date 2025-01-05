import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:5000/api/customers/${id}`, config);
      setFormData({
        name: data.name,
        email: data.email,
        avatar: data.avatar || '',
      });
    } catch (error) {
      toast.error('Kullanıcı bilgileri alınamadı');
      navigate('/admin/customers');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = formData.avatar;

      // Eğer yeni bir fotoğraf yüklendiyse
      if (formData.avatar instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.avatar);

        const uploadConfig = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const uploadResponse = await axios.post(
          'http://localhost:5000/api/upload',
          imageFormData,
          uploadConfig
        );

        avatarUrl = uploadResponse.data.url;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const userData = {
        name: formData.name,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {}),
        avatar: avatarUrl,
      };

      await axios.put(`http://localhost:5000/api/customers/${id}`, userData, config);
      toast.success('Kullanıcı başarıyla güncellendi');
      navigate('/admin/customers');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Kullanıcı Düzenle</h2>
      <div className="flex mb-6">
        <button
          onClick={() => navigate('/admin/customers')}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          ← Geri Dön
        </button>
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            İsim
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Şifre (Boş bırakılabilir)
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Profil Fotoğrafı
          </label>
          <div className="flex items-center space-x-4">
            {formData.avatar && (
              <img
                src={formData.avatar instanceof File ? URL.createObjectURL(formData.avatar) : formData.avatar}
                alt="Profil"
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="py-2"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
