const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const APPROACHING_THRESHOLD = 0.8; 


function monthRange(month) {
  const [year, mon] = month.split('-').map(Number);
  const start = `${month}-01`;
  const next = mon === 12 ? `${year + 1}-01-01` : `${year}-${String(mon + 1).padStart(2, '0')}-01`;
  return { start, next };
}

function getStatus(budget, spent) {
  if (budget === null) return 'none';
  if (spent > budget) return 'over';
  if (budget === 0 || spent >= budget * APPROACHING_THRESHOLD) return 'approaching';
  return 'within';
}


async function buildBudgetSummary(userId, month) {
  const budgetResult = await pool.query(
    'SELECT amount::float AS amount FROM budgets WHERE user_id = $1 AND month = $2',
    [userId, month]
  );
  const budget = budgetResult.rows.length > 0 ? budgetResult.rows[0].amount : null;

  const { start, next } = monthRange(month);
  const spentResult = await pool.query(
    `SELECT COALESCE(SUM(amount), 0)::float AS spent
     FROM expenses
     WHERE user_id = $1 AND expense_date >= $2 AND expense_date < $3`,
    [userId, start, next]
  );
  const spent = spentResult.rows[0].spent;

  return {
    month,
    amount: budget,
    spent,
    remaining: budget === null ? null : Math.round((budget - spent) * 100) / 100,
    status: getStatus(budget, spent),
  };
}


router.get('/:month', async (req, res) => {
  try {
    const { month } = req.params;
    if (!MONTH_REGEX.test(month)) {
      return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
    }
    res.json({ budget: await buildBudgetSummary(req.user.id, month) });
  } catch (err) {
    console.error('Get budget error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


router.put('/:month', async (req, res) => {
  try {
    const { month } = req.params;
    if (!MONTH_REGEX.test(month)) {
      return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
    }

    const raw = req.body.amount;
    const amount = Number(raw);
    if (raw === '' || raw === null || raw === undefined || !Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ error: 'Amount must be a number of 0 or more' });
    }
    if (amount > 9999999999.99) {
      return res.status(400).json({ error: 'Amount is too large' });
    }

    await pool.query(
      `INSERT INTO budgets (user_id, month, amount)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, month) DO UPDATE SET amount = EXCLUDED.amount`,
      [req.user.id, month, Math.round(amount * 100) / 100]
    );

    res.json({ budget: await buildBudgetSummary(req.user.id, month) });
  } catch (err) {
    console.error('Set budget error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;