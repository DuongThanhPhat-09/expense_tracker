import express from 'express';
import {
  getBudgets,
  createBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getBudgets).post(createBudget);
router.route('/:id').delete(deleteBudget);

export default router;
