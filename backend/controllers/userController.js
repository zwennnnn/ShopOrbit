import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { cloudinary } from '../config/cloudinary.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Geçersiz email veya şifre');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Bu email adresi zaten kullanımda');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Geçersiz kullanıcı bilgileri');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      user.avatar = result.secure_url;
    } else {
      user.avatar = req.body.avatar || user.avatar;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Lütfen bir resim yükleyin' });
  }

  // Buffer'ı base64'e çevir
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

  // Cloudinary'ye yükle
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'avatars',
    width: 300,
    crop: "scale"
  });

  // Kullanıcıyı güncelle
  const user = await User.findById(req.user._id);
  if (user) {
    // Eski avatar'ı Cloudinary'den sil (varsa)
    if (user.avatar && user.avatar.includes('cloudinary')) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`avatars/${publicId}`);
    }

    user.avatar = result.secure_url;
    await user.save();

    res.json({
      message: 'Avatar başarıyla güncellendi',
      avatar: result.secure_url
    });
  } else {
    res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }
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
    res.status(404).json({ message: 'Kullanıcı bulunamadı' });
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
    res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }
});

// Kullanıcıyı sil
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: 'Kullanıcı silindi' });
  } else {
    res.status(404).json({ message: 'Kullanıcı bulunamadı' });
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
    return res.status(400).json({ message: 'Bu email ile bir kullanıcı zaten mevcut' });
  }

  const user = new User({
    name,
    email,
    password, // Şifreyi hash'lemeniz gerekebilir
    image: imageUrl,
  });

  const createdUser = await user.save();
  res.status(201).json(createdUser);
});

export {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
};
