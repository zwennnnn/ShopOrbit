import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [cartCount, setCartCount] = useState(0);
  const { userInfo } = useAuth();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cartItems]);

  const addToCart = async (productId, quantity) => {
    try {
      // Get product details first
      const { data: product } = await axiosInstance.get(`/api/products/${productId}`);
      
      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.product._id === productId);
      
      if (existingItemIndex !== -1) {
        // Update quantity if product exists
        const newCartItems = [...cartItems];
        newCartItems[existingItemIndex].quantity += quantity;
        setCartItems(newCartItems);
      } else {
        // Add new item if product doesn't exist
        setCartItems(prev => [...prev, {
          product: {
            _id: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            discountPrice: product.discountPrice,
            isDiscount: product.isDiscount,
            brand: product.brand,
            countInStock: product.countInStock
          },
          quantity
        }]);
      }
      return true;
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems(prev => prev.filter(item => item.product._id !== productId));
  };

  const updateQuantity = async (productId, quantity) => {
    setCartItems(prev => prev.map(item => 
      item.product._id === productId 
        ? { ...item, quantity } 
        : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.isDiscount ? item.product.discountPrice : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const value = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
