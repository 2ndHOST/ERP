const express = require('express');
const { pool } = require('../utils/db');
const { authenticateToken } = require('../utils/auth');
const { Blockchain } = require('../blockchain/blockchain');

const router = express.Router();

// Initialize blockchain instance
const blockchain = new Blockchain();

// Verify blockchain integrity
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // Get all blocks from database
    const [blocks] = await pool.execute(`
      SELECT * FROM blocks 
      ORDER BY block_index ASC
    `);

    // Reconstruct blockchain from database
    const reconstructedChain = [];
    for (const block of blocks) {
      reconstructedChain.push({
        index: block.block_index,
        timestamp: block.timestamp,
        data: {
          type: block.data_type,
          recordId: block.record_id,
          recordHash: block.data_hash
        },
        previousHash: block.prev_hash,
        hash: block.block_hash
      });
    }

    // Verify chain integrity
    let isValid = true;
    const issues = [];

    for (let i = 1; i < reconstructedChain.length; i++) {
      const currentBlock = reconstructedChain[i];
      const previousBlock = reconstructedChain[i - 1];

      // Check if current block hash is valid
      const expectedHash = require('crypto')
        .createHash('sha256')
        .update(
          currentBlock.index + 
          currentBlock.previousHash + 
          currentBlock.timestamp + 
          JSON.stringify(currentBlock.data)
        )
        .digest('hex');

      if (currentBlock.hash !== expectedHash) {
        isValid = false;
        issues.push(`Block ${currentBlock.index}: Invalid hash`);
      }

      // Check if current block points to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        isValid = false;
        issues.push(`Block ${currentBlock.index}: Invalid previous hash reference`);
      }
    }

    // Get blockchain statistics
    const totalBlocks = reconstructedChain.length;
    const blockTypes = {};
    reconstructedChain.forEach(block => {
      const type = block.data.type;
      blockTypes[type] = (blockTypes[type] || 0) + 1;
    });

    res.json({
      success: true,
      isValid,
      issues,
      statistics: {
        totalBlocks,
        blockTypes,
        lastBlockHash: reconstructedChain.length > 0 
          ? reconstructedChain[reconstructedChain.length - 1].hash 
          : null,
        firstBlockHash: reconstructedChain.length > 0 
          ? reconstructedChain[0].hash 
          : null
      },
      chain: reconstructedChain
    });
  } catch (error) {
    console.error('Blockchain verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blockchain status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    // Get basic blockchain statistics
    const [blockCount] = await pool.execute('SELECT COUNT(*) as count FROM blocks');
    const [typeStats] = await pool.execute(`
      SELECT data_type, COUNT(*) as count 
      FROM blocks 
      GROUP BY data_type
    `);
    const [latestBlock] = await pool.execute(`
      SELECT * FROM blocks 
      ORDER BY block_index DESC 
      LIMIT 1
    `);

    res.json({
      success: true,
      totalBlocks: blockCount[0].count,
      blockTypes: typeStats,
      latestBlock: latestBlock.length > 0 ? latestBlock[0] : null
    });
  } catch (error) {
    console.error('Get blockchain status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get block by hash
router.get('/block/:hash', authenticateToken, async (req, res) => {
  try {
    const { hash } = req.params;

    const [blocks] = await pool.execute(
      'SELECT * FROM blocks WHERE block_hash = ?',
      [hash]
    );

    if (blocks.length === 0) {
      return res.status(404).json({ error: 'Block not found' });
    }

    const block = blocks[0];
    const blockData = {
      index: block.block_index,
      timestamp: block.timestamp,
      data: {
        type: block.data_type,
        recordId: block.record_id,
        recordHash: block.data_hash
      },
      previousHash: block.prev_hash,
      hash: block.block_hash
    };

    res.json({
      success: true,
      block: blockData
    });
  } catch (error) {
    console.error('Get block error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blocks by type
router.get('/blocks/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const [blocks] = await pool.execute(`
      SELECT * FROM blocks 
      WHERE data_type = ? 
      ORDER BY block_index DESC 
      LIMIT ? OFFSET ?
    `, [type, parseInt(limit), parseInt(offset)]);

    const blockData = blocks.map(block => ({
      index: block.block_index,
      timestamp: block.timestamp,
      data: {
        type: block.data_type,
        recordId: block.record_id,
        recordHash: block.data_hash
      },
      previousHash: block.prev_hash,
      hash: block.block_hash
    }));

    res.json({
      success: true,
      blocks: blockData,
      total: blocks.length
    });
  } catch (error) {
    console.error('Get blocks by type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
