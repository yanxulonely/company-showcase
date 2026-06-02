const fs = require('fs');
const path = require('path');
const { db } = require('../db');
const { seedDefaultMaterials } = require('../seedMaterials');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (fs.existsSync(UPLOADS_DIR)) {
  for (const file of fs.readdirSync(UPLOADS_DIR)) {
    if (file.startsWith('seed-')) {
      fs.unlinkSync(path.join(UPLOADS_DIR, file));
    }
  }
}

db.prepare('DELETE FROM materials').run();
seedDefaultMaterials(db);

const count = db.prepare('SELECT COUNT(*) as count FROM materials').get().count;
console.log(`Resynced ${count} material(s)`);
