import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Profile from './Pages/User/Profile';
import PrivateRoute from './Components/PrivateRoute';
import AdminDashboard from './Pages/Admin/Dashboard';
import AdminLayout from './Components/Admin/AdminLayout';
import Products from './Pages/Admin/Products/Products';
import AddProduct from './Pages/Admin/Products/AddProduct';
import Categories from './Pages/Admin/Categories/Categories';
import EditProduct from './Pages/Admin/Products/EditProduct';
import ProductDetail from './Pages/Shop/ProductDetail';
import ProductList from './Pages/Shop/ProductList';
import Category from './Pages/Shop/Category';
import { CartProvider } from './context/CartContext';
import Cart from './Pages/Shop/Cart';
import Checkout from './Pages/Shop/Checkout';
import Orders from './Pages/Orders/Orders';
import AdminOrders from './Pages/Admin/Orders';


function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CartProvider>
        <Navbar />
        <div className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/category" element={<Category />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<Products />} />
                      <Route path="products/add" element={<AddProduct />} />
                      <Route path="products/edit/:id" element={<EditProduct />} />
                      <Route path="categories" element={<Categories />} />
                      <Route path="orders" element={<AdminOrders />} />
                    </Routes>
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            {/* Diğer route'lar */}
          </Routes>
        </div>
      </CartProvider>
      {!isAdminRoute && <Footer />}
      <ToastContainer />
    </div>
  );
}

export default App;
