import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Category from '../models/categoryModel.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Son 7 günün tarihini al
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  // Toplam istatistikler
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalCustomers = await User.countDocuments({ isAdmin: false });
  
  // Toplam satışları hesapla
  const totalSales = await Order.aggregate([
    { 
      $match: { 
        status: 'Tamamlandı',
      } 
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' }
      }
    }
  ]);

  // Günlük satışları hesapla
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: lastWeek },
        status: 'Tamamlandı'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$totalPrice' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Son siparişleri al
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(5);

  // Stok durumu kritik olan ürünleri al (stok < 10)
  const lowStockProducts = await Product.find({ countInStock: { $lt: 10 } })
    .select('name countInStock')
    .limit(5);

  // En çok satan ürünleri al
  const topProducts = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalQuantity: { $sum: '$orderItems.qty' },
        totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 }
  ]);

  res.json({
    stats: {
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      totalProducts,
      totalCustomers,
    },
    dailySales,
    recentOrders,
    lowStockProducts,
    topProducts
  });
});

// Ürünleri getir - Optimize edilmiş
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  // Paralel sorgu çalıştırma
  const [products, total] = await Promise.all([
    Product.find()
      .select('name price countInStock isDiscount discountPrice isFlash flashDiscountRate image category')
      .populate('category', 'name')
      .sort('-createdAt')
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .lean()
      .exec(),
    Product.countDocuments()
  ]);

  res.json({
    products,
    page,
    pages: Math.ceil(total / pageSize),
    total
  });
});

// İstatistikleri getir - Optimize edilmiş
const getProductStats = asyncHandler(async (req, res) => {
  const stats = await Product.aggregate([
    {
      $facet: {
        "counts": [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              outOfStock: { 
                $sum: { 
                  $cond: [{ $eq: ["$countInStock", 0] }, 1, 0] 
                }
              },
              discounted: { 
                $sum: { 
                  $cond: ["$isDiscount", 1, 0] 
                }
              },
              flashSale: { 
                $sum: { 
                  $cond: ["$isFlash", 1, 0] 
                }
              }
            }
          }
        ]
      }
    }
  ]).exec();

  const counts = stats[0].counts[0] || {
    totalProducts: 0,
    outOfStock: 0,
    discounted: 0,
    flashSale: 0
  };

  res.json(counts);
});

// Kategorileri getir - Optimize edilmiş
const getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name')
      .lean()
      .exec();
      
    res.json(categories);
  } catch (error) {
    console.error('Kategori yükleme hatası:', error);
    res.status(500);
    throw new Error('Kategoriler yüklenirken bir hata oluştu');
  }
});

// Tek ürün getir - Optimize edilmiş
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .select('name description price countInStock category image isDiscount discountPrice discountEndDate isFlash flashEndDate flashDiscountRate')
    .populate('category', 'name')
    .lean()
    .exec();

  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }

  res.json(product);
});

// Ürün güncelle - Optimize edilmiş
const updateProduct = asyncHandler(async (req, res) => {
  const updates = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    countInStock: req.body.countInStock,
    category: req.body.category
  };

  if (req.body.image) {
    updates.image = req.body.image;
  }

  if (req.body.isDiscount) {
    updates.isDiscount = true;
    updates.discountPrice = req.body.discountPrice;
    updates.discountEndDate = req.body.discountEndDate;
  } else {
    updates.isDiscount = false;
    updates.discountPrice = 0;
    updates.discountEndDate = null;
  }

  if (req.body.isFlash) {
    updates.isFlash = true;
    updates.flashDiscountRate = req.body.flashDiscountRate;
    updates.flashEndDate = req.body.flashEndDate;
  } else {
    updates.isFlash = false;
    updates.flashDiscountRate = 0;
    updates.flashEndDate = null;
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    updates,
    { 
      new: true,
      runValidators: true 
    }
  )
    .select('name description price countInStock category image isDiscount discountPrice discountEndDate isFlash flashEndDate flashDiscountRate')
    .populate('category', 'name')
    .lean()
    .exec();

  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }

  res.json(product);
});

// Dashboard stats export'u
export { 
  getDashboardStats, 
  getProducts,
  getProductStats,
  getCategories,
  getProductById,
  updateProduct
};