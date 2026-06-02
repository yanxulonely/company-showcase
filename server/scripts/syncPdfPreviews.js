const { initDatabase, db } = require('../db');

initDatabase();

const rows = db.prepare(`
  SELECT id, title, file_url, pdf_url FROM materials WHERE file_type IN ('ppt', 'pptx')
`).all();

console.log(JSON.stringify(rows, null, 2));
