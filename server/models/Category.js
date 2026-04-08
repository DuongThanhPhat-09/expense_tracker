import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Please specify income or expense'],
    },
    color: {
      type: String,
      default: '#6b7280',
    },
    icon: {
      type: String,
      default: 'tag',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
