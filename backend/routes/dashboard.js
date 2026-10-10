const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { buildBudgetSummary, monthRange } = require('../services/budgetSummary');

const router = express.Router();

router.use(requireAuth);

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;


function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}


const EXPENSE_SELECT = `
  SELECT e.id, e.title, e.amount::float AS amount, e.category_id AS "categoryId",
         c.name AS "categoryName", to_char(e.expense_date, 'YYYY-MM-DD') AS date,
         e.payment_method AS "paymentMethod", e.notes,
         e.created_at AS "createdAt", e.updated_at AS "updatedAt"
  FROM expenses e
  JOIN categories c ON c.id = e.category_id
`;


router.get('/', async (req, res) => {
  try {
    const month = req.query.month || currentMonth();
    if (!MONTH_REGEX.test(month)) {
      return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
    }

    const userId = req.user.id;
    const { start, next } = monthRange(month);

    const [budget, highest, byCategory, recent] = await Promise.all([
      buildBudgetSummary(userId, month),
      pool.query(
        `${EXPENSE_SELECT}
         WHERE e.user_id = $1 AND e.expense_date >= $2 AND e.expense_date < $3
         ORDER BY e.amount DESC, e.id DESC
         LIMIT 1`,
        [userId, start, next]
      ),
      pool.query(
        `SELECT c.id AS "categoryId", c.name AS "categoryName",
                SUM(e.amount)::float AS total, COUNT(*)::int AS count
         FROM expenses e
         JOIN categories c ON c.id = e.category_id
         WHERE e.user_id = $1 AND e.expense_date >= $2 AND e.expense_date < $3
         GROUP BY c.id, c.name
         ORDER BY total DESC`,
        [userId, start, next]
      ),
      pool.query(
        `${EXPENSE_SELECT}
         WHERE e.user_id = $1
         ORDER BY e.expense_date DESC, e.id DESC
         LIMIT 5`,
        [userId]
      ),
    ]);

    res.json({
      month,
      totalSpent: budget.spent,
      budget,
      highestExpense: highest.rows[0] || null,
      spendingByCategory: byCategory.rows,
      recentExpenses: recent.rows,
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;