const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public: get all settings
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const data = {};
  rows.forEach(r => { data[r.key] = r.value; });
  res.json({ code: 200, message: 'success', data });
});

// Admin: update settings (batch)
router.put('/', authMiddleware, (req, res) => {
  const settings = req.body;
  const upsert = db.prepare(
    'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP'
  );
  const updateMany = db.transaction((entries) => {
    for (const [key, value] of entries) {
      upsert.run(key, value);
    }
  });
  updateMany(Object.entries(settings));
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
