const pool = require('../db/pool');

async function makeAdmin() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run make-admin -- <email>');
    process.exitCode = 1;
    return pool.end();
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, name, email, role",
      [email]
    );
    if (result.rows.length === 0) {
      console.error(`No user found with email ${email}`);
      process.exitCode = 1;
    } else {
      console.log('Promoted to admin:', result.rows[0]);
    }
  } catch (err) {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

makeAdmin();