
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(50) NOT NULL UNIQUE,
  is_default BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id    INTEGER       NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title          VARCHAR(150)  NOT NULL,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  expense_date   DATE          NOT NULL,
  payment_method VARCHAR(20)   NOT NULL
                 CHECK (payment_method IN ('cash', 'card', 'mobile money', 'bank transfer')),
  notes          TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month      CHAR(7)       NOT NULL CHECK (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'), 
  amount     NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, month)
);


CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category  ON expenses (category_id);


INSERT INTO categories (name, is_default) VALUES
  ('Uncategorized', TRUE),
  ('Food', FALSE),
  ('Transport', FALSE),
  ('Housing', FALSE),
  ('Utilities', FALSE),
  ('Health', FALSE),
  ('Education', FALSE),
  ('Entertainment', FALSE),
  ('Shopping', FALSE)
ON CONFLICT (name) DO NOTHING;