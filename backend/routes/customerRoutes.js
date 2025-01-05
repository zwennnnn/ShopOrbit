import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';

const router = express.Router();

// /api/customers
router.route('/')
  .get(protect, admin, getCustomers)
  .post(protect, admin, createCustomer);

// /api/customers/:id
router.route('/:id')
  .get(protect, admin, getCustomerById)
  .put(protect, admin, updateCustomer)
  .delete(protect, admin, deleteCustomer);

export default router;