import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  getFlashSaleProducts,
  getDiscountedProducts,
  getTopCategories,
  getProductsByCategory,
  getAllCategoriesWithProducts,
  getAllProducts,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart
} from '../controllers/productController.js';

const router = express.Router();

router.get('/stats', protect, admin, getProductStats);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/discounted', getDiscountedProducts);
router.get('/categories/top', getTopCategories);
router.get('/all', getAllProducts);
router.get('/categories/all', getAllCategoriesWithProducts);
router.get('/category/:categoryName', getProductsByCategory);

// Cart operations
router.get('/cart', protect, getCart);
router.post('/:id/add-to-cart', protect, addToCart);
router.delete('/:id/remove-from-cart', protect, removeFromCart);
router.put('/:id/update-quantity', protect, updateCartQuantity);

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;