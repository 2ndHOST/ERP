const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data))
      .digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), {
      type: 'genesis',
      message: 'Genesis block for Student ERP System'
    }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      previousBlock.index + 1,
      new Date().toISOString(),
      data,
      previousBlock.hash
    );
    this.chain.push(newBlock);
    return newBlock;
  }

  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if current block hash is valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Check if current block points to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getBlockByHash(hash) {
    return this.chain.find(block => block.hash === hash);
  }

  getBlocksByType(type) {
    return this.chain.filter(block => block.data.type === type);
  }

  getChainLength() {
    return this.chain.length;
  }

  getLastNBlocks(n) {
    return this.chain.slice(-n);
  }

  // Generate a hash for database record
  generateRecordHash(record) {
    const recordString = JSON.stringify(record, Object.keys(record).sort());
    return crypto.createHash('sha256').update(recordString).digest('hex');
  }

  // Add a database record to blockchain
  addRecord(type, record) {
    const recordHash = this.generateRecordHash(record);
    const blockData = {
      type: type,
      recordId: record.id,
      recordHash: recordHash,
      timestamp: new Date().toISOString()
    };
    
    return this.addBlock(blockData);
  }
}

module.exports = { Block, Blockchain };
