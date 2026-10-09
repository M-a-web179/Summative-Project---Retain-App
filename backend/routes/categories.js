const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();


router.use(requireAuth);


function cleanName(name) {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50 ? trimmed : null;
}


router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, is_default FROM categories ORDER BY is_default DESC, name ASC'
    );
    res.json({ categories: result.rows });
  } catch (err) {
    console.error('List categories error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


router.post('/', requireAdmin, async (req, res) => {
  try {
    const name = cleanName(req.body.name);
    if (!name) {
      return res.status(400).json({ error: 'Category name must be 2 to 50 characters' });
    }

    const exists = await pool.query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name, is_default',
      [name]
    );
    res.status(201).json({ category: result.rows[0] });
  } catch (err) {
    console.error('Create category error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid category id' });
    }

    const name = cleanName(req.body.name);
    if (!name) {
      return res.status(400).json({ error: 'Category name must be 2 to 50 characters' });
    }

    const current = await pool.query('SELECT id, is_default FROM categories WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (current.rows[0].is_default) {
      return res.status(400).json({ error: 'The default category cannot be renamed' });
    }

    const duplicate = await pool.query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id <> $2',
      [name, id]
    );
    if (duplicate.rows.length > 0) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    const result = await pool.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name, is_default',
      [name, id]
    );
    res.json({ category: result.rows[0] });
  } catch (err) {
    console.error('Update category error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid category id' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const current = await client.query('SELECT id, is_default FROM categories WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Category not found' });
    }
    if (current.rows[0].is_default) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'The default category cannot be deleted' });
    }

    const fallback = await client.query('SELECT id FROM categories WHERE is_default = TRUE LIMIT 1');
    if (fallback.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: 'Default category is missing' });
    }

    const moved = await client.query(
      'UPDATE expenses SET category_id = $1 WHERE category_id = $2',
      [fallback.rows[0].id, id]
    );
    await client.query('DELETE FROM categories WHERE id = $1', [id]);

    await client.query('COMMIT');
    res.json({ message: 'Category deleted', expensesReassigned: moved.rowCount });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete category error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  } finally {
    client.release(); 
  }
});

module.exports = router;