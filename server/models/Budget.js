import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please add a category'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add a budget amount'],
      min: [0, 'Amount must be a positive number'],
    },
    month: {
      type: Number,
      required: [true, 'Please add a month'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please add a year'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    spent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ category: 1, month: 1, year: 1, user: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
