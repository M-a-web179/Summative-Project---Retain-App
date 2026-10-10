const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();


router.use(requireAuth);

const PAYMENT_METHODS = ['cash', 'card', 'mobile_money', 'bank_transfer'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;


function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}


function validateExpense(body) {
  const { title, amount, categoryId, date, paymentMethod, notes } = body;

  if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 150) {
    return { error: 'Title is required (max 150 characters)' };
  }
  const amountNumber = Number(amount);
  if (amount === '' || amount === null || amount === undefined || !Number.isFinite(amountNumber) || amountNumber <= 0) {
    return { error: 'Amount must be a number greater than 0' };
  }
  if (amountNumber > 9999999999.99) {
    return { error: 'Amount is too large' };
  }
  if (!Number.isInteger(Number(categoryId))) {
    return { error: 'A valid category is required' };
  }
  if (!isValidDate(date)) {
    return { error: 'Date must be in YYYY-MM-DD format' };
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return { error: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}` };
  }
  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    return { error: 'Notes must be text' };
  }

  return {
    data: {
      title: title.trim(),
      amount: Math.round(amountNumber * 100) / 100,
      categoryId: Number(categoryId),
      date,
      paymentMethod,
      notes: notes && notes.trim() ? notes.trim() : null,
    },
  };
}


const EXPENSE_SELECT = `
  SELECT e.id, e.title, e.amount::float AS amount, e.category_id AS "categoryId",
         c.name AS "categoryName", to_char(e.expense_date, 'YYYY-MM-DD') AS date,
         e.payment_method AS "paymentMethod", e.notes,
         e.created_at AS "createdAt", e.updated_at AS "updatedAt"
  FROM expenses e
  JOIN categories c ON c.id = e.category_id
`;


router.post('/', async (req, res) => {
  try {
    const { error, data } = validateExpense(req.body);
    if (error) return res.status(400).json({ error });

    const category = await pool.query('SELECT id FROM categories WHERE id = $1', [data.categoryId]);
    if (category.rows.length === 0) {
      return res.status(400).json({ error: 'Category does not exist' });
    }

    const inserted = await pool.query(
      `INSERT INTO expenses (user_id, category_id, title, amount, expense_date, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [req.user.id, data.categoryId, data.title, data.amount, data.date, data.paymentMethod, data.notes]
    );

    const result = await pool.query(`${EXPENSE_SELECT} WHERE e.id = $1`, [inserted.rows[0].id]);
    res.status(201).json({ expense: result.rows[0] });
  } catch (err) {
    console.error('Create expense error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


router.get('/', async (req, res) => {
  try {
    const { search, category, paymentMethod, startDate, endDate } = req.query;

    
    const conditions = ['e.user_id = $1'];
    const params = [req.user.id];

    if (search) {
      params.push(`%${String(search).trim()}%`);
      conditions.push(`e.title ILIKE $${params.length}`);
    }
    if (category) {
      if (!Number.isInteger(Number(category))) {
        return res.status(400).json({ error: 'Invalid category filter' });
      }
      params.push(Number(category));
      conditions.push(`e.category_id = $${params.length}`);
    }
    if (paymentMethod) {
      if (!PAYMENT_METHODS.includes(paymentMethod)) {
        return res.status(400).json({ error: 'Invalid payment method filter' });
      }
      params.push(paymentMethod);
      conditions.push(`e.payment_method = $${params.length}`);
    }
    if (startDate) {
      if (!isValidDate(startDate)) return res.status(400).json({ error: 'startDate must be YYYY-MM-DD' });
      params.push(startDate);
      conditions.push(`e.expense_date >= $${params.length}`);
    }
    if (endDate) {
      if (!isValidDate(endDate)) return res.status(400).json({ error: 'endDate must be YYYY-MM-DD' });
      params.push(endDate);
      conditions.push(`e.expense_date <= $${params.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    
    const sortColumn = req.query.sortBy === 'amount' ? 'e.amount' : 'e.expense_date';
    const direction = req.query.order === 'asc' ? 'ASC' : 'DESC';

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM expenses e ${where}`, params);
    const total = countResult.rows[0].total;

    const listParams = [...params, limit, offset];
    const list = await pool.query(
      `${EXPENSE_SELECT} ${where}
       ORDER BY ${sortColumn} ${direction}, e.id DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    res.json({
      expenses: list.rows,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (err) {
    console.error('List expenses error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid expense id' });
    }

   
    const result = await pool.query(`${EXPENSE_SELECT} WHERE e.id = $1 AND e.user_id = $2`, [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ expense: result.rows[0] });
  } catch (err) {
    console.error('Get expense error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;