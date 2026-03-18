require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const adb = require('./adb');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(bodyParser.json());

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { username: user.username, role: user.role } });
  });
});

app.get('/api/devices', authenticateToken, async (req, res) => {
  const devices = await adb.getDevices();
  const detailedDevices = await Promise.all(devices.map(async (d) => {
    const details = await adb.getDeviceDetails(d.id);
    return { ...d, ...details };
  }));
  res.json(detailedDevices);
});

app.post('/api/remove-mdm', authenticateToken, async (req, res) => {
  const { deviceId, packages } = req.body;
  if (!deviceId || !packages) {
    return res.status(400).json({ error: 'Device ID and packages are required' });
  }

  try {
    const results = await adb.removeMDM(deviceId, packages);
    
    // Log operation
    const status = results.every(r => r.status === 'success') ? 'success' : 'partial_failure';
    db.run(`INSERT INTO operations (device_id, operation_type, status, details) VALUES (?, ?, ?, ?)`,
      [deviceId, 'MDM_REMOVAL', status, JSON.stringify(results)]);

    res.json({ status, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/operations', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM operations ORDER BY timestamp DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
