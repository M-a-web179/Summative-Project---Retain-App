const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();


router.use(requireAuth, requireAdmin);


router.get('/insights', async (req, res) => {
  try {
    const [totals, thisMonth, perCategory, recentExpenses, recentUsers] = await Promise.all([
      pool.query(
        `SELECT (SELECT COUNT(*) FROM users)::int AS "totalUsers",
                COUNT(*)::int AS "totalExpenses",
                COALESCE(SUM(amount), 0)::float AS "totalExpenseValue"
         FROM expenses`
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM expenses
         WHERE created_at >= date_trunc('month', NOW())
           AND created_at <  date_trunc('month', NOW()) + INTERVAL '1 month'`
      ),
  
      pool.query(
        `SELECT c.id AS "categoryId", c.name AS "categoryName",
                COUNT(e.id)::int AS count,
                COALESCE(SUM(e.amount), 0)::float AS total
         FROM categories c
         LEFT JOIN expenses e ON e.category_id = c.id
         GROUP BY c.id, c.name`
      ),
      pool.query(
        `SELECT e.id, e.title, e.amount::float AS amount,
                c.name AS "categoryName", u.name AS "userName",
                to_char(e.expense_date, 'YYYY-MM-DD') AS date,
                e.created_at AS "createdAt"
         FROM expenses e
         JOIN categories c ON c.id = e.category_id
         JOIN users u ON u.id = e.user_id
         ORDER BY e.created_at DESC, e.id DESC
         LIMIT 5`
      ),
      pool.query(
        `SELECT id, name, email, role, created_at AS "createdAt"
         FROM users
         ORDER BY created_at DESC, id DESC
         LIMIT 5`
      ),
    ]);

    const categories = perCategory.rows;

    const mostUsed = [...categories]
      .sort((a, b) => b.count - a.count || a.categoryName.localeCompare(b.categoryName))
      .slice(0, 5);
    const leastUsed = [...categories]
      .sort((a, b) => a.count - b.count || a.categoryName.localeCompare(b.categoryName))
      .slice(0, 5);
    const spendingByCategory = [...categories].sort((a, b) => b.total - a.total);

    res.json({
      totalUsers: totals.rows[0].totalUsers,
      totalExpenses: totals.rows[0].totalExpenses,
      totalExpenseValue: totals.rows[0].totalExpenseValue,
      expensesThisMonth: thisMonth.rows[0].count,
      spendingByCategory,
      mostUsedCategories: mostUsed,
      leastUsedCategories: leastUsed,
      recentExpenses: recentExpenses.rows,
      recentUsers: recentUsers.rows,
    });
  } catch (err) {
    console.error('Admin insights error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;