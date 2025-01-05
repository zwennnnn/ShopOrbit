import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getProducts,
  getProductStats,
  getCategories,
  getProductById,
  updateProduct
} from '../controllers/adminController.js';

// Admin routes
const router = express.Router();

// Dashboard routes
router.get('/dashboard', protect, admin, getDashboardStats);

// Product routes
router.route('/products')
  .get(protect, admin, getProducts);

router.route('/products/stats')
  .get(protect, admin, getProductStats);

router.route('/categories')
  .get(protect, admin, getCategories);

router.route('/products/:id')
  .get(protect, admin, getProductById)
  .put(protect, admin, updateProduct);

export default router;