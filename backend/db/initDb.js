const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function init() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);

    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('Tables:', tables.rows.map((r) => r.table_name));

    const cats = await pool.query('SELECT id, name, is_default FROM categories ORDER BY id');
    console.log('Categories:', cats.rows);
  } catch (err) {
    console.error('Database init failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();