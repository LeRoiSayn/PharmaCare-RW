const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalOrders,
      monthOrders,
      totalCustomers,
      monthCustomers,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      topProducts,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.findMany({ where: { stock: { lte: 10 } }, orderBy: { stock: 'asc' }, take: 5 }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { name: true, price: true } });
        return { ...item, product };
      })
    );

    const salesLast7Days = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));
        return prisma.order.aggregate({
          where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
          _sum: { total: true },
          _count: true,
        }).then((r) => ({
          date: start.toISOString().split('T')[0],
          revenue: r._sum.total || 0,
          orders: r._count,
        }));
      })
    );

    res.json({
      summary: {
        totalRevenue: totalRevenue._sum.total || 0,
        monthRevenue: monthRevenue._sum.total || 0,
        lastMonthRevenue: lastMonthRevenue._sum.total || 0,
        totalOrders,
        monthOrders,
        totalCustomers,
        monthCustomers,
        pendingOrders,
      },
      lowStockProducts,
      recentOrders,
      topProducts: topProductsWithNames,
      ordersByStatus,
      salesLast7Days,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

module.exports = { getDashboard };
