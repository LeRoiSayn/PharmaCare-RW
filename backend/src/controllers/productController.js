const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getProducts = async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 12, minPrice, maxPrice } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { activeIngredient: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl, prescriptionRequired, dosage, manufacturer, activeIngredient, sideEffects, featured } = req.body;
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    const product = await prisma.product.create({
      data: { name, description, price: parseFloat(price), stock: parseInt(stock), category, imageUrl, prescriptionRequired: prescriptionRequired === true || prescriptionRequired === 'true', dosage, manufacturer, activeIngredient, sideEffects, featured: featured === true || featured === 'true' },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl, prescriptionRequired, dosage, manufacturer, activeIngredient, sideEffects, featured } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(category && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(prescriptionRequired !== undefined && { prescriptionRequired: prescriptionRequired === true || prescriptionRequired === 'true' }),
        ...(dosage !== undefined && { dosage }),
        ...(manufacturer !== undefined && { manufacturer }),
        ...(activeIngredient !== undefined && { activeIngredient }),
        ...(sideEffects !== undefined && { sideEffects }),
        ...(featured !== undefined && { featured: featured === true || featured === 'true' }),
      },
    });
    res.json(product);
  } catch {
    res.status(500).json({ message: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

const getCategories = async (req, res) => {
  const categories = [
    'PAIN_RELIEF', 'ANTIBIOTICS', 'VITAMINS_SUPPLEMENTS', 'CARDIOVASCULAR',
    'DIABETES', 'RESPIRATORY', 'DIGESTIVE', 'DERMATOLOGY',
    'MENTAL_HEALTH', 'FIRST_AID', 'BABY_CARE', 'PERSONAL_CARE',
  ];
  res.json(categories);
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories };
