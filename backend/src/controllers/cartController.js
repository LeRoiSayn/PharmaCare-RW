const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }
  return cart;
};

const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } catch {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + parseInt(quantity);
      if (product.stock < newQty) return res.status(400).json({ message: 'Insufficient stock' });
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity: parseInt(quantity) } });
    }

    const updatedCart = await getOrCreateCart(req.user.id);
    res.json(updatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: parseInt(quantity) } });
    }
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } catch {
    res.status(500).json({ message: 'Failed to update cart item' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } catch {
    res.status(500).json({ message: 'Failed to remove item' });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Cart cleared' });
  } catch {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
