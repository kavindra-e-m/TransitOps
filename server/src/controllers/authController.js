const db = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) return res.status(400).json({ error: 'Email already registered.' });

    const password_hash = bcrypt.hashSync(password, 10);
    const insert = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    const result = insert.run(name, email, password_hash, role || 'Dispatcher');

    res.status(201).json({ id: result.lastInsertRowid, name, email, role: role || 'Dispatcher' });
  } catch (error) {
    res.status(500).json({ error: 'Database error during signup.' });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(403).json({ error: 'Invalid credentials. Account locked after 5 failed attempts.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      const attempts = user.failed_login_attempts + 1;
      if (attempts >= 5) {
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Lock for 15 mins
        db.prepare('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?').run(attempts, lockedUntil, user.id);
        return res.status(403).json({ error: 'Invalid credentials. Account locked after 5 failed attempts.' });
      } else {
        db.prepare('UPDATE users SET failed_login_attempts = ? WHERE id = ?').run(attempts, user.id);
        return res.status(400).json({ error: 'Invalid email or password.' });
      }
    }

    // Reset attempts on successful login
    db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?').run(user.id);

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Database error during login.' });
  }
};

module.exports = { signup, login };
