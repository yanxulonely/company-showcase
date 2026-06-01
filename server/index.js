const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');

const authRoutes = require('./routes/auth');
const casesRoutes = require('./routes/cases');
const capabilitiesRoutes = require('./routes/capabilities');
const reviewsRoutes = require('./routes/reviews');
const standardsRoutes = require('./routes/standards');
const contactsRoutes = require('./routes/contacts');
const settingsRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/upload');
const usersRoutes = require('./routes/users');
const bannersRoutes = require('./routes/banners');
const materialsRoutes = require('./routes/materials');
const materialCategoriesRoutes = require('./routes/material-categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Init DB
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/capabilities', capabilitiesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/standards', standardsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/material-categories', materialCategoriesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'success', data: { status: 'ok' } });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
