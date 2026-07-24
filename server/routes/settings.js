const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { serializeModuleVisibility } = require('../lib/moduleVisibility');

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
  const settings = { ...req.body };
  if (settings.module_visibility !== undefined) {
    settings.module_visibility = serializeModuleVisibility(settings.module_visibility);
  }
  const upsert = db.prepare(
    'INSERT INTO settings (`key`, value, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()'
  );
  for (const [key, value] of Object.entries(settings)) {
    upsert.run(key, value);
  }
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
