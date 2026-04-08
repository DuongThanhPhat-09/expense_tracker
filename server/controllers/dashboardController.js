import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

// @desc    Get dashboard data for a given month/year
// @route   GET /api/dashboard
export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const userId = new mongoose.Types.ObjectId(req.user);

    const baseMatch = {
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    };

    // Total income and expense
    const totals = await Transaction.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    totals.forEach((item) => {
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpense = item.total;
    });

    // Expenses grouped by category
    const byCategory = await Transaction.aggregate([
      { $match: { ...baseMatch, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: '$categoryInfo.name',
          color: '$categoryInfo.color',
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Recent 5 transactions
    const recentTransactions = await Transaction.find(baseMatch)
      .populate('category', 'name type color icon')
      .sort({ date: -1 })
      .limit(5);

    // Daily trend for the month
    const daysInMonth = new Date(year, month, 0).getDate();

    const dailyAgg = await Transaction.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const dailyMap = {};
    dailyAgg.forEach((item) => {
      const day = item._id.day;
      if (!dailyMap[day]) {
        dailyMap[day] = { income: 0, expense: 0 };
      }
      dailyMap[day][item._id.type] = item.total;
    });

    const dailyTrend = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dailyTrend.push({
        date: dateStr,
        income: dailyMap[d]?.income || 0,
        expense: dailyMap[d]?.expense || 0,
      });
    }

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
      recentTransactions,
      dailyTrend,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
