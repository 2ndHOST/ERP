const express = require('express');
const { pool } = require('../utils/db');
const { authenticateToken } = require('../utils/auth');
const { Blockchain } = require('../blockchain/blockchain');

const router = express.Router();

// Initialize blockchain instance
const blockchain = new Blockchain();

// Get blockchain statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = blockchain.getStats();
    
    // Get additional database stats
    const [blockCount] = await pool.execute('SELECT COUNT(*) as count FROM blocks');
    const [recentBlocks] = await pool.execute(`
      SELECT * FROM blocks 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    res.json({
      success: true,
      blockchain: stats,
      database: {
        totalBlocks: blockCount[0].count,
        recentBlocks: recentBlocks
      }
    });
  } catch (error) {
    console.error('Get blockchain stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify a record against blockchain
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { recordType, recordId, blockchainHash } = req.body;
    
    if (!recordType || !recordId || !blockchainHash) {
      return res.status(400).json({ 
        error: 'Record type, record ID, and blockchain hash are required' 
      });
    }
    
    // Get the record from database
    let record = null;
    let tableName = '';
    
    switch (recordType) {
      case 'fee_payment':
        tableName = 'fees';
        const [fees] = await pool.execute(
          'SELECT * FROM fees WHERE id = ?',
          [recordId]
        );
        if (fees.length > 0) {
          record = fees[0];
        }
        break;
        
      case 'admission':
      case 'admission_update':
        tableName = 'students';
        const [students] = await pool.execute(
          'SELECT * FROM students WHERE id = ?',
          [recordId]
        );
        if (students.length > 0) {
          record = students[0];
        }
        break;
        
      case 'hostel_allocation':
      case 'hostel_deallocation':
        tableName = 'hostel';
        const [hostel] = await pool.execute(
          'SELECT * FROM hostel WHERE id = ?',
          [recordId]
        );
        if (hostel.length > 0) {
          record = hostel[0];
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid record type' });
    }
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Verify against blockchain
    const verification = blockchain.verifyRecord(record, blockchainHash);
    
    res.json({
      success: true,
      verification: verification,
      record: {
        type: recordType,
        id: recordId,
        table: tableName,
        data: record
      }
    });
  } catch (error) {
    console.error('Verify record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blockchain chain
router.get('/chain', authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const chain = blockchain.getLastNBlocks(parseInt(limit));
    
    res.json({
      success: true,
      chain: chain,
      totalBlocks: blockchain.getChainLength(),
      isValid: blockchain.isValid()
    });
  } catch (error) {
    console.error('Get blockchain chain error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blocks by type
router.get('/blocks/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const blocks = blockchain.getBlocksByType(type);
    
    res.json({
      success: true,
      blocks: blocks,
      count: blocks.length,
      type: type
    });
  } catch (error) {
    console.error('Get blocks by type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get block by hash
router.get('/block/:hash', authenticateToken, async (req, res) => {
  try {
    const { hash } = req.params;
    const block = blockchain.getBlockByHash(hash);
    
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }
    
    res.json({
      success: true,
      block: block
    });
  } catch (error) {
    console.error('Get block by hash error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;