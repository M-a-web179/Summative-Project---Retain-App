const pool = require('../db/pool');

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

module.exports = { buildBudgetSummary, monthRange };