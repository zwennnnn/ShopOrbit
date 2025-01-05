import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  uploadAvatar 
} from '../controllers/userController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
