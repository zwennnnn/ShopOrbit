import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { cloudinary } from '../config/cloudinary.js';

// Cloudinary ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Kullanıcıları al
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isAdmin: false });
  res.json(users);
});

// Kullanıcıyı ID ile al
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// Kullanıcıyı güncelle
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Eğer yeni bir fotoğraf yüklendiyse, Cloudinary'e yükle
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      user.image = result.secure_url;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// Kullanıcıyı sil
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: 'Kullanıcı silindi' });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// Yeni kullanıcı oluştur
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  let imageUrl;

  // Fotoğraf yükleme
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    imageUrl = result.secure_url;
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Bu email ile bir kullanıcı zaten mevcut');
  }

  const user = await User.create({
    name,
    email,
    password,
    image: imageUrl,
  });

  if (user) {
    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error('Geçersiz kullanıcı bilgileri');
  }
});

export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
};