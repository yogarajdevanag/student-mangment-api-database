const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// ✅ MySQL Connection Pool Setup
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Yogu@2112', // Change if needed
    database: 'studentmangedb', // Make sure this DB exists
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// ✅ Create Table if Not Exists
const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            age INT
        )
    `;
    try {
        await pool.execute(query);
        console.log("✅ Students table is ready.");
    } catch (err) {
        console.error("❌ Error creating table:", err.message);
    }
};
createTable();

// ➕ POST /students → Insert new student
app.post('/students', async (req, res) => {
    const { name, email, age } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO students (name, email, age) VALUES (?, ?, ?)',
            [name, email, age]
        );
        console.log("✅ Inserted:", name);
        res.status(201).json({ id: result.insertId, name, email, age });
    } catch (err) {
        console.error("❌ Insert error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 📄 GET /students → Retrieve all students
app.get('/students', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM students');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔍 GET /students/:id → Retrieve by ID
app.get('/students/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✏️ PUT /students/:id → Update by ID
app.put('/students/:id', async (req, res) => {
    const { name, email, age } = req.body;
    try {
        const [result] = await pool.execute(
            'UPDATE students SET name = ?, email = ?, age = ? WHERE id = ?',
            [name, email, age, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
        console.log("✏️ Updated ID:", req.params.id);
        res.json({ id: req.params.id, name, email, age });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗑️ DELETE /students/:id → Delete by ID
app.delete('/students/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
        console.log("🗑️ Deleted ID:", req.params.id);
        res.json({ message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
