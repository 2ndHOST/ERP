const express = require('express');
const { pool } = require('../utils/db');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { Blockchain } = require('../blockchain/blockchain');

const router = express.Router();

// Initialize blockchain instance
const blockchain = new Blockchain();

// Get all admissions
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT s.*, u.username 
      FROM students s 
      LEFT JOIN users u ON s.id = u.student_id 
      ORDER BY s.created_at DESC
    `);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get admissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new admission
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, course, dob, address, phone } = req.body;

    if (!name || !email || !course || !dob || !address) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check if student already exists
    const [existingStudents] = await pool.execute(
      'SELECT id FROM students WHERE email = ?',
      [email]
    );

    if (existingStudents.length > 0) {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }

    // Insert student data
    const [result] = await pool.execute(
      'INSERT INTO students (name, email, course, dob, address, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, course, dob, address, phone || null]
    );

    const studentId = result.insertId;
    const studentData = {
      id: studentId,
      name,
      email,
      course,
      dob,
      address,
      phone
    };

    // Add to blockchain
    const block = blockchain.addRecord('admission', studentData);

    // Store block in database
    await pool.execute(
      'INSERT INTO blocks (block_index, timestamp, data_hash, prev_hash, block_hash, data_type, record_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        block.index,
        block.timestamp,
        block.data.recordHash,
        block.previousHash,
        block.hash,
        'admission',
        studentId
      ]
    );

    res.json({
      success: true,
      student: studentData,
      blockchainHash: block.hash
    });
  } catch (error) {
    console.error('Create admission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admission by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ success: true, student: students[0] });
  } catch (error) {
    console.error('Get admission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update admission
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, course, dob, address, phone } = req.body;

    // Check if student exists
    const [existingStudents] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    if (existingStudents.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update student data
    await pool.execute(
      'UPDATE students SET name = ?, email = ?, course = ?, dob = ?, address = ?, phone = ? WHERE id = ?',
      [name, email, course, dob, address, phone, id]
    );

    const updatedStudent = {
      id: parseInt(id),
      name,
      email,
      course,
      dob,
      address,
      phone
    };

    // Add update to blockchain
    const block = blockchain.addRecord('admission_update', updatedStudent);

    // Store block in database
    await pool.execute(
      'INSERT INTO blocks (block_index, timestamp, data_hash, prev_hash, block_hash, data_type, record_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        block.index,
        block.timestamp,
        block.data.recordHash,
        block.previousHash,
        block.hash,
        'admission_update',
        id
      ]
    );

    res.json({
      success: true,
      student: updatedStudent,
      blockchainHash: block.hash
    });
  } catch (error) {
    console.error('Update admission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
