import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get('http://localhost:5000/api/customers', config);
      // Normal kullanıcıları filtrele (admin olmayanlar)
      const filteredUsers = data.filter(user => !user.isAdmin);
      setUsers(filteredUsers);
    } catch (error) {
      toast.error('Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        await axios.delete(`http://localhost:5000/api/customers/${id}`, config);
        toast.success('Kullanıcı başarıyla silindi');
        fetchUsers();
      } catch (error) {
        toast.error('Kullanıcı silinirken bir hata oluştu');
      }
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kullanıcılar</h2>
        <Link
          to="/admin/customers/add"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Yeni Kullanıcı Ekle
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Profil
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                İsim
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">
                  {user.isAdmin ? 'Evet' : 'Hayır'}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300 text-right">
                  <button
                    onClick={() => navigate(`/admin/customers/edit/${user._id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
