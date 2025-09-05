const express = require('express');
const { pool } = require('../utils/db');
const { authenticateToken } = require('../utils/auth');
const { Blockchain } = require('../blockchain/blockchain');
const { generateReceipt, generateQRCode } = require('../utils/receipt');

const router = express.Router();

// Initialize blockchain instance
const blockchain = new Blockchain();

// Get all fees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.query;
    let query = `
      SELECT f.*, s.name as student_name, s.email as student_email, s.course 
      FROM fees f 
      JOIN students s ON f.student_id = s.id
    `;
    let params = [];

    if (studentId) {
      query += ' WHERE f.student_id = ?';
      params.push(studentId);
    }

    query += ' ORDER BY f.payment_date DESC';

    const [fees] = await pool.execute(query, params);
    res.json({ success: true, fees });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create fee payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { studentId, amount } = req.body;
    const userId = req.user.studentId || req.user.id;

    if (!studentId || !amount) {
      return res.status(400).json({ error: 'Student ID and amount are required' });
    }

    // Check if student exists
    const [students] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = students[0];

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Insert fee record
    const [result] = await pool.execute(
      'INSERT INTO fees (student_id, amount, status, transaction_id) VALUES (?, ?, ?, ?)',
      [studentId, amount, 'paid', transactionId]
    );

    const feeId = result.insertId;
    const feeData = {
      id: feeId,
      student_id: studentId,
      amount: parseFloat(amount),
      payment_date: new Date().toISOString(),
      status: 'paid',
      transaction_id: transactionId
    };

    // Add to blockchain
    const block = blockchain.addRecord('fee_payment', feeData);

    // Update fee record with blockchain hash
    await pool.execute(
      'UPDATE fees SET blockchain_hash = ? WHERE id = ?',
      [block.hash, feeId]
    );

    // Store block in database
    await pool.execute(
      'INSERT INTO blocks (block_index, timestamp, data_hash, prev_hash, block_hash, data_type, record_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        block.index,
        block.timestamp,
        block.data.recordHash,
        block.previousHash,
        block.hash,
        'fee_payment',
        feeId
      ]
    );

    // Generate receipt
    const receiptBuffer = await generateReceipt(feeData, student, block.hash);
    const qrCode = await generateQRCode(block.hash);

    res.json({
      success: true,
      fee: feeData,
      student: student,
      blockchainHash: block.hash,
      receipt: receiptBuffer.toString('base64'),
      qrCode: qrCode
    });
  } catch (error) {
    console.error('Create fee payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [fees] = await pool.execute(`
      SELECT f.*, s.name as student_name, s.email as student_email, s.course 
      FROM fees f 
      JOIN students s ON f.student_id = s.id 
      WHERE f.id = ?
    `, [id]);

    if (fees.length === 0) {
      return res.status(404).json({ error: 'Fee record not found' });
    }

    res.json({ success: true, fee: fees[0] });
  } catch (error) {
    console.error('Get fee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate receipt
router.get('/:id/receipt', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [fees] = await pool.execute(`
      SELECT f.*, s.name, s.email, s.course 
      FROM fees f 
      JOIN students s ON f.student_id = s.id 
      WHERE f.id = ?
    `, [id]);

    if (fees.length === 0) {
      return res.status(404).json({ error: 'Fee record not found' });
    }

    const fee = fees[0];
    const student = {
      id: fee.student_id,
      name: fee.name,
      email: fee.email,
      course: fee.course
    };

    const receiptBuffer = await generateReceipt(fee, student, fee.blockchain_hash);
    const qrCode = await generateQRCode(fee.blockchain_hash);

    res.json({
      success: true,
      receipt: receiptBuffer.toString('base64'),
      qrCode: qrCode
    });
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
