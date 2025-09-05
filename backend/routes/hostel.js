const express = require('express');
const { pool } = require('../utils/db');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { Blockchain } = require('../blockchain/blockchain');

const router = express.Router();

// Initialize blockchain instance
const blockchain = new Blockchain();

// Get all hostel allocations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [allocations] = await pool.execute(`
      SELECT h.*, s.name as student_name, s.email as student_email, s.course 
      FROM hostel h 
      JOIN students s ON h.student_id = s.id 
      ORDER BY h.allocated_at DESC
    `);

    res.json({ success: true, allocations });
  } catch (error) {
    console.error('Get hostel allocations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Allocate hostel room
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentId, roomNo } = req.body;

    if (!studentId || !roomNo) {
      return res.status(400).json({ error: 'Student ID and room number are required' });
    }

    // Check if student exists
    const [students] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if room is already allocated
    const [existingAllocations] = await pool.execute(
      'SELECT * FROM hostel WHERE room_no = ? AND status = "active"',
      [roomNo]
    );

    if (existingAllocations.length > 0) {
      return res.status(400).json({ error: 'Room is already allocated' });
    }

    // Check if student already has an active allocation
    const [studentAllocations] = await pool.execute(
      'SELECT * FROM hostel WHERE student_id = ? AND status = "active"',
      [studentId]
    );

    if (studentAllocations.length > 0) {
      return res.status(400).json({ error: 'Student already has an active hostel allocation' });
    }

    // Insert hostel allocation
    const [result] = await pool.execute(
      'INSERT INTO hostel (student_id, room_no, status) VALUES (?, ?, ?)',
      [studentId, roomNo, 'active']
    );

    const allocationId = result.insertId;
    const allocationData = {
      id: allocationId,
      student_id: studentId,
      room_no: roomNo,
      allocated_at: new Date().toISOString(),
      status: 'active'
    };

    // Add to blockchain
    const block = blockchain.addRecord('hostel_allocation', allocationData);

    // Update allocation with blockchain hash
    await pool.execute(
      'UPDATE hostel SET blockchain_hash = ? WHERE id = ?',
      [block.hash, allocationId]
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
        'hostel_allocation',
        allocationId
      ]
    );

    res.json({
      success: true,
      allocation: allocationData,
      blockchainHash: block.hash
    });
  } catch (error) {
    console.error('Create hostel allocation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get hostel allocation by student ID
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const [allocations] = await pool.execute(`
      SELECT h.*, s.name as student_name, s.email as student_email, s.course 
      FROM hostel h 
      JOIN students s ON h.student_id = s.id 
      WHERE h.student_id = ? AND h.status = 'active'
    `, [studentId]);

    if (allocations.length === 0) {
      return res.status(404).json({ error: 'No active hostel allocation found' });
    }

    res.json({ success: true, allocation: allocations[0] });
  } catch (error) {
    console.error('Get hostel allocation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deallocate hostel room
router.put('/:id/deallocate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if allocation exists
    const [allocations] = await pool.execute(
      'SELECT * FROM hostel WHERE id = ?',
      [id]
    );

    if (allocations.length === 0) {
      return res.status(404).json({ error: 'Hostel allocation not found' });
    }

    const allocation = allocations[0];

    if (allocation.status === 'inactive') {
      return res.status(400).json({ error: 'Allocation is already inactive' });
    }

    // Update allocation status
    await pool.execute(
      'UPDATE hostel SET status = ? WHERE id = ?',
      ['inactive', id]
    );

    const deallocationData = {
      id: parseInt(id),
      student_id: allocation.student_id,
      room_no: allocation.room_no,
      deallocated_at: new Date().toISOString(),
      status: 'inactive'
    };

    // Add deallocation to blockchain
    const block = blockchain.addRecord('hostel_deallocation', deallocationData);

    // Store block in database
    await pool.execute(
      'INSERT INTO blocks (block_index, timestamp, data_hash, prev_hash, block_hash, data_type, record_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        block.index,
        block.timestamp,
        block.data.recordHash,
        block.previousHash,
        block.hash,
        'hostel_deallocation',
        id
      ]
    );

    res.json({
      success: true,
      message: 'Hostel room deallocated successfully',
      blockchainHash: block.hash
    });
  } catch (error) {
    console.error('Deallocate hostel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
