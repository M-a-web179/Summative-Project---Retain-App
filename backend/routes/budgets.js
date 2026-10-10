const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { buildBudgetSummary } = require('../services/budgetSummary');

const router = express.Router();

router.use(requireAuth);

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

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