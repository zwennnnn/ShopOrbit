import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Lütfen bir resim yükleyin' });
  }
  
  // Dosya yolu oluştur
  const filePath = `/${req.file.path.replace(/\\/g, '/')}`;
  res.json({ url: filePath });
});

export default router;
