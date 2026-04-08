import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  { name: 'Ăn uống', type: 'expense', color: '#ef4444', icon: 'utensils' },
  { name: 'Di chuyển', type: 'expense', color: '#f97316', icon: 'car' },
  { name: 'Mua sắm', type: 'expense', color: '#8b5cf6', icon: 'shopping-bag' },
  { name: 'Hoá đơn', type: 'expense', color: '#06b6d4', icon: 'file-text' },
  { name: 'Giải trí', type: 'expense', color: '#ec4899', icon: 'gamepad' },
  { name: 'Sức khoẻ', type: 'expense', color: '#10b981', icon: 'heart' },
  { name: 'Giáo dục', type: 'expense', color: '#6366f1', icon: 'book' },
  { name: 'Khác', type: 'expense', color: '#6b7280', icon: 'tag' },
  { name: 'Lương', type: 'income', color: '#22c55e', icon: 'wallet' },
  { name: 'Thưởng', type: 'income', color: '#eab308', icon: 'gift' },
  { name: 'Đầu tư', type: 'income', color: '#3b82f6', icon: 'trending-up' },
  { name: 'Khác', type: 'income', color: '#6b7280', icon: 'tag' },
];

// @desc    Seed default categories for a new user
export const seedDefaultCategories = async (userId) => {
  const categories = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    user: userId,
    isDefault: true,
  }));
  await Category.insertMany(categories);
};

// @desc    Get all categories for user
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user }).sort({
      type: 1,
      name: 1,
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Type must be income or expense' });
    }

    const category = await Category.create({
      name,
      type,
      color: color || '#6b7280',
      icon: icon || 'tag',
      user: req.user,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { name, type, color, icon } = req.body;

    if (name) category.name = name;
    if (type) category.type = type;
    if (color) category.color = color;
    if (icon) category.icon = icon;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (category.isDefault) {
      return res
        .status(400)
        .json({ message: 'Cannot delete default categories' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
