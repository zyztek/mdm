const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(async () => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )`);

    // Operations table
    db.run(`CREATE TABLE IF NOT EXISTS operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT,
        device_model TEXT,
        operation_type TEXT,
        status TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        details TEXT
    )`);

    // Create default admin if not exists
    const adminUser = 'admin';
    const adminPass = 'admin123';
    const hashedPass = await bcrypt.hash(adminPass, 10);
    
    db.get(`SELECT id FROM users WHERE username = ?`, [adminUser], (err, row) => {
        if (!row) {
            db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [adminUser, hashedPass, 'admin']);
            console.log('Default admin user created.');
        }
    });

    console.log('Database initialized successfully.');
});

// We don't close immediately because of the async bcrypt and db.get
setTimeout(() => db.close(), 2000);
