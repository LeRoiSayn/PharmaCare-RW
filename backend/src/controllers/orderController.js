const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, phone, notes, prescriptionUrl, paymentMethod, paymentPhone } = req.body;
    if (!shippingAddress || !phone) {
      return res.status(400).json({ message: 'Shipping address and phone are required' });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const hasPrescriptionRequired = cart.items.some((item) => item.product.prescriptionRequired);
    if (hasPrescriptionRequired && !prescriptionUrl) {
      return res.status(400).json({ message: 'Prescription required for some items in cart' });
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.product.name}` });
      }
    }

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        shippingAddress,
        phone,
        notes,
        prescriptionUrl,
        paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
        paymentPhone: paymentPhone || null,
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
    });

    await Promise.all(
      cart.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: { select: { name: true, imageUrl: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, ...(req.user.role !== 'ADMIN' && { userId: req.user.id }) },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true, phone: true } },
      },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { user: { select: { name: true, email: true } } },
    });
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
