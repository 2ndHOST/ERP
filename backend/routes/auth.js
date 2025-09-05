const express = require('express');
const { pool } = require('../utils/db');
const { generateToken, comparePassword } = require('../utils/auth');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    // Find user in database
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND role = ?',
      [username, role]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      studentId: user.student_id
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        studentId: user.student_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register student endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, studentData } = req.body;

    if (!username || !email || !password || !studentData) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate required student data fields
    if (!studentData.name || !studentData.course || !studentData.dob || !studentData.address) {
      return res.status(400).json({ error: 'Name, course, date of birth, and address are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert student data
      const [studentResult] = await connection.execute(
        'INSERT INTO students (name, email, course, dob, address, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [
          studentData.name,
          email, // Use the email from the main request, not studentData
          studentData.course,
          studentData.dob,
          studentData.address,
          studentData.phone || null
        ]
      );

      const studentId = studentResult.insertId;

      // Insert user data
      await connection.execute(
        'INSERT INTO users (username, email, password, role, student_id) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, 'student', studentId]
      );

      await connection.commit();

      // Generate JWT token
      const token = generateToken({
        id: studentId,
        username,
        email,
        role: 'student',
        studentId
      });

      res.json({
        success: true,
        token,
        user: {
          id: studentId,
          username,
          email,
          role: 'student',
          studentId
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const { verifyToken } = require('../utils/auth');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Get user details from database
    const [users] = await pool.execute(
      'SELECT id, username, email, role, student_id FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
