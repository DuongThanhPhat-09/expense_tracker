import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// @desc    Get budgets for user with spent calculation
// @route   GET /api/budgets
export const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;

    const filter = { user: req.user };

    if (month) filter.month = parseInt(month, 10);
    if (year) filter.year = parseInt(year, 10);

    const budgets = await Budget.find(filter).populate(
      'category',
      'name type color icon'
    );

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59, 999);

        const result = await Transaction.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(req.user),
              category: budget.category._id,
              type: 'expense',
              date: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]);

        const spent = result.length > 0 ? result[0].total : 0;

        return {
          ...budget.toObject(),
          spent,
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create or update a budget (upsert)
// @route   POST /api/budgets
export const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined || !month || !year) {
      return res
        .status(400)
        .json({ message: 'Category, amount, month, and year are required' });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        category,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        user: req.user,
      },
      {
        category,
        amount,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        user: req.user,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate('category', 'name type color icon');

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
