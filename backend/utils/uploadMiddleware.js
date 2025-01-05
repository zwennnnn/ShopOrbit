import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
  // Kabul edilen dosya tipleri
  const fileTypes = /jpeg|jpg|png|gif/;
  // Dosya uzantısını kontrol et
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // MIME tipini kontrol et
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Sadece resim dosyaları yüklenebilir!');
  }
};

// Multer ayarları
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

export default upload;
