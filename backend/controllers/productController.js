import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';

// @desc    Fetch all products with pagination and filtering
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  
  try {
    // Temel sorgu oluştur
    const baseQuery = {};

    // Arama filtresi
    if (req.query.keyword) {
      baseQuery.name = {
        $regex: req.query.keyword,
        $options: 'i',
      };
    }

    // Kategori filtresi
    if (req.query.category) {
      baseQuery.category = req.query.category;
    }

    const now = new Date();

    // İndirim ve flash sale filtresi
    if (req.query.isDiscount === 'true') {
      baseQuery.isDiscount = true;
      baseQuery.discountEndDate = { $gt: now };
    }
    if (req.query.isFlash === 'true') {
      baseQuery.isFlash = true;
      baseQuery.flashEndDate = { $gt: now };
    }

    // Paralel sorgu işlemleri için Promise.all kullan
    const [products, count] = await Promise.all([
      Product.find(baseQuery)
        .select('name price image brand isDiscount discountPrice isFlash flashDiscountRate countInStock category')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(pageSize * (page - 1))
        .limit(pageSize)
        .lean(), // Mongoose belgelerini JS objelerine dönüştür (daha hızlı)
      Product.countDocuments(baseQuery)
    ]);

    // Süresi geçmiş indirimleri arka planda güncelle
    process.nextTick(async () => {
      try {
        await Product.updateMany(
          {
            $or: [
              { isDiscount: true, discountEndDate: { $lt: now } },
              { isFlash: true, flashEndDate: { $lt: now } }
            ]
          },
          {
            $set: {
              isDiscount: false,
              discountPrice: 0,
              discountEndDate: null,
              isFlash: false,
              flashDiscountRate: 0,
              flashEndDate: null
            }
          }
        );
      } catch (error) {
        console.error('Süresi geçmiş indirimleri güncellerken hata:', error);
      }
    });

    // Hızlı yanıt dön
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });

  } catch (error) {
    console.error('Ürünleri getirirken hata:', error);
    res.status(500).json({
      message: 'Ürünler getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get product by ID with populated category
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .lean();

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
});

// @desc    Get products by category name
// @route   GET /api/products/category/:categoryName
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  console.log('Category name:', req.params.categoryName);
  
  const category = await Category.findOne({ 
    name: { $regex: new RegExp('^' + req.params.categoryName + '$', 'i') }
  });

  if (!category) {
    console.log('Category not found');
    return res.status(404).json({ message: 'Kategori bulunamadı' });
  }

  console.log('Found category:', category);

  const products = await Product.find({ category: category._id })
    .populate('category', 'name');

  console.log('Found products:', products.length);

  res.json({ products, category });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    category, 
    countInStock, 
    brand = 'Varsayılan Marka',
    isDiscount = false,
    discountPrice,
    discountEndDate,
    isFlash = false,
    flashEndDate,
    flashDiscountRate,
  } = req.body;

  // Kategori kontrolü
  if (!category) {
    res.status(400);
    throw new Error('Kategori seçilmelidir');
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Geçerli bir kategori seçilmelidir');
  }

  // İndirim ve flash sale aynı anda aktif olamaz
  if (isDiscount && isFlash) {
    res.status(400);
    throw new Error('Bir ürün aynı anda hem indirimde hem flash satışta olamaz');
  }

  // İndirim fiyatı kontrolleri
  if (isDiscount && (!discountPrice || parseFloat(discountPrice) >= parseFloat(price))) {
    res.status(400);
    throw new Error('İndirim fiyatı normal fiyattan düşük olmalıdır');
  }

  // Flash sale kontrolleri
  if (isFlash && (!flashDiscountRate || flashDiscountRate <= 0 || flashDiscountRate >= 100)) {
    res.status(400);
    throw new Error('Flash satış için geçerli bir indirim oranı girilmelidir (1-99 arası)');
  }

  // Stok kontrolü
  if (countInStock === undefined || countInStock < 0) {
    res.status(400);
    throw new Error('Geçerli bir stok miktarı girilmelidir');
  }

  const product = new Product({
    name,
    description,
    price: parseFloat(price),
    category,
    countInStock: parseInt(countInStock),
    brand,
    image,
    isDiscount,
    discountPrice: isDiscount ? parseFloat(discountPrice) : 0,
    discountEndDate: isDiscount ? discountEndDate : null,
    isFlash,
    flashEndDate: isFlash ? flashEndDate : null,
    flashDiscountRate: isFlash ? parseFloat(flashDiscountRate) : 0,
  });

  const createdProduct = await product.save();
  
  // Populate category before sending response
  const populatedProduct = await Product.findById(createdProduct._id)
    .populate('category', 'name')
    .lean();

  res.status(201).json(populatedProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    categoryId,
    stock,
    brand,
    isDiscount,
    discountPrice,
    discountEndDate,
    isFlash,
    flashEndDate,
    flashDiscountRate,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Eğer kategori güncelleniyorsa, geçerli olduğunu kontrol et
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        res.status(400);
        throw new Error('Geçerli bir kategori ID\'si girilmelidir');
      }
      product.category = categoryId;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;
    product.countInStock = stock !== undefined ? stock : product.countInStock;
    product.brand = brand || product.brand;
    
    // İndirim ve flash sale güncellemeleri
    if (isDiscount !== undefined) product.isDiscount = isDiscount;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (discountEndDate !== undefined) product.discountEndDate = discountEndDate;
    if (isFlash !== undefined) product.isFlash = isFlash;
    if (flashEndDate !== undefined) product.flashEndDate = flashEndDate;
    if (flashDiscountRate !== undefined) product.flashDiscountRate = flashDiscountRate;

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id).populate('category', 'name');
    res.json(populatedProduct);
  } else {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Ürün silindi' });
  } else {
    res.status(404).json({ message: 'Ürün bulunamadı' });
  }
});

// @desc    Get product stats
// @route   GET /api/products/stats
// @access  Private/Admin
const getProductStats = asyncHandler(async (req, res) => {
  try {
    // Toplam ürün sayısı
    const totalProducts = await Product.countDocuments();

    // Stokta olmayan ürünler
    const outOfStock = await Product.countDocuments({ countInStock: 0 });

    // İndirimli ürünler
    const discountedProducts = await Product.countDocuments({
      isDiscount: true,
      discountEndDate: { $gt: new Date() }
    });

    // Flash sale ürünler
    const flashSaleProducts = await Product.countDocuments({
      isFlash: true,
      flashEndDate: { $gt: new Date() }
    });

    // En çok satılan ürünler (son 30 gün)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topSellingProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.qty' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          name: '$productInfo.name',
          totalSold: 1,
          price: '$productInfo.price'
        }
      }
    ]);

    res.json({
      totalProducts,
      outOfStock,
      discountedProducts,
      flashSaleProducts,
      topSellingProducts,
    });
  } catch (error) {
    console.error('Ürün istatistikleri alınırken hata:', error);
    res.status(500).json({
      message: 'İstatistikler alınırken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get flash sale products
// @route   GET /api/products/flash-sale
// @access  Public
const getFlashSaleProducts = asyncHandler(async (req, res) => {
  const flashSaleProducts = await Product.find({
    isFlash: true,
    flashEndDate: { $gt: new Date() },
    countInStock: { $gt: 0 }
  })
  .populate('category', 'name')
  .select('name price image category flashDiscountRate flashEndDate')
  .sort('-flashDiscountRate')
  .limit(8)
  .lean();

  res.json(flashSaleProducts);
});

// @desc    Get discounted products
// @route   GET /api/products/discounted
// @access  Public
const getDiscountedProducts = asyncHandler(async (req, res) => {
  const discountedProducts = await Product.find({
    isDiscount: true,
    discountEndDate: { $gt: new Date() },
    countInStock: { $gt: 0 }
  })
  .populate('category', 'name')
  .select('name price image category discountPrice discountEndDate')
  .sort({ 'discountPrice': 1 })
  .limit(12)
  .lean();

  res.json(discountedProducts);
});

// @desc    Get top categories with product counts
// @route   GET /api/categories/top
// @access  Public
const getTopCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        image: { $first: '$image' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: '$categoryInfo'
    },
    {
      $project: {
        _id: 1,
        name: '$categoryInfo.name',
        productCount: 1,
        image: 1
      }
    },
    {
      $sort: { productCount: -1 }
    },
    {
      $limit: 4
    }
  ]);

  res.json(categories);
});

// @desc    Add product to cart
// @route   POST /api/products/:id/add-to-cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { quantity = 1 } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }

  if (product.countInStock < quantity) {
    res.status(400);
    throw new Error('Yetersiz stok');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: []
    });
  }

  const cartItemIndex = cart.items.findIndex(item => 
    item.product.toString() === product._id.toString()
  );

  if (cartItemIndex > -1) {
    cart.items[cartItemIndex].quantity += parseInt(quantity);
  } else {
    cart.items.push({
      product: product._id,
      quantity: parseInt(quantity),
      price: product.isDiscount ? product.discountPrice : product.price
    });
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id)
    .populate({
      path: 'items.product',
      select: 'name image price discountPrice isDiscount countInStock'
    });

  res.status(200).json(populatedCart);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  let cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    res.status(404);
    throw new Error('Sepet bulunamadı');
  }

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();

  cart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name image price discountPrice isDiscount countInStock'
  });

  res.json(cart);
});

const updateCartQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Geçersiz miktar');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    res.status(404);
    throw new Error('Sepet bulunamadı');
  }

  const cartItem = cart.items.find(item => item.product.toString() === productId);
  
  if (!cartItem) {
    res.status(404);
    throw new Error('Ürün sepette bulunamadı');
  }

  const product = await Product.findById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }

  if (product.countInStock < quantity) {
    res.status(400);
    throw new Error('Yetersiz stok');
  }

  cartItem.quantity = parseInt(quantity);
  await cart.save();

  cart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name image price discountPrice isDiscount countInStock'
  });

  res.json(cart);
});

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name image price discountPrice isDiscount countInStock brand'
    });

  if (!cart) {
    // If no cart exists, return empty cart
    return res.json({ items: [] });
  }

  res.json(cart);
});

// @desc    Get all categories with products
// @route   GET /api/categories/all
// @access  Public
const getAllCategoriesWithProducts = asyncHandler(async (req, res) => {
  try {
    const { 
      minPrice, 
      maxPrice, 
      brand,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (brand) {
      filter.brand = brand;
    }

    // Get products first
    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Get categories and assign filtered products
    const categories = await Category.find();
    const productsByCategory = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    const categoriesWithProducts = categories.map(category => ({
      ...category.toObject(),
      products: productsByCategory[category._id] || []
    }));

    // Get total counts for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      categories: categoriesWithProducts,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error in getAllCategoriesWithProducts:', error);
    res.status(500).json({ message: 'Kategoriler ve ürünler yüklenirken bir hata oluştu' });
  }
});

// @desc    Get all products with filters
// @route   GET /api/products/all
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const { 
      minPrice, 
      maxPrice, 
      brand,
      category,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price':
        sortObj = { price: 1 };
        break;
      case '-price':
        sortObj = { price: -1 };
        break;
      case 'name':
        sortObj = { name: 1 };
        break;
      case '-name':
        sortObj = { name: -1 };
        break;
      case '-createdAt':
      default:
        sortObj = { createdAt: -1 };
    }

    // Get products with filters and sorting
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('category', 'name');

    // Get total counts for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get all unique brands for filter options
    const uniqueBrands = await Product.distinct('brand');

    // Get price range for filter options
    const priceRange = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.status(200).json({
      products,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filterOptions: {
        brands: uniqueBrands,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
      }
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ message: 'Ürünler yüklenirken bir hata oluştu' });
  }
});

export {
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
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
  getAllCategoriesWithProducts,
  getAllProducts
};