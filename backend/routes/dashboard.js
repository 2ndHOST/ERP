const express = require('express');
const { pool } = require('../utils/db');
const { authenticateToken, requireAdmin } = require('../utils/auth');

const router = express.Router();

// Get dashboard data
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total students count
    const [studentCount] = await pool.execute('SELECT COUNT(*) as count FROM students');
    const totalStudents = studentCount[0].count;

    // Get total fees collected
    const [feesData] = await pool.execute(`
      SELECT 
        COUNT(*) as totalTransactions,
        SUM(amount) as totalAmount,
        AVG(amount) as averageAmount
      FROM fees 
      WHERE status = 'paid'
    `);
    const feesStats = feesData[0];

    // Get hostel occupancy
    const [hostelData] = await pool.execute(`
      SELECT 
        COUNT(*) as totalAllocations,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as activeAllocations
      FROM hostel
    `);
    const hostelStats = hostelData[0];

    // Get admission trends (last 12 months)
    const [admissionTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM students 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    // Get fee collection trends (last 12 months)
    const [feeTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        COUNT(*) as transactions,
        SUM(amount) as totalAmount
      FROM fees 
      WHERE status = 'paid' AND payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY month
    `);

    // Get recent admissions (last 10)
    const [recentAdmissions] = await pool.execute(`
      SELECT id, name, email, course, created_at 
      FROM students 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    // Get recent fee payments (last 10)
    const [recentFees] = await pool.execute(`
      SELECT f.id, f.amount, f.payment_date, s.name as student_name, s.course
      FROM fees f 
      JOIN students s ON f.student_id = s.id 
      WHERE f.status = 'paid'
      ORDER BY f.payment_date DESC 
      LIMIT 10
    `);

    // Get course distribution
    const [courseDistribution] = await pool.execute(`
      SELECT course, COUNT(*) as count 
      FROM students 
      GROUP BY course 
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      summary: {
        totalStudents,
        totalFeesCollected: feesStats.totalAmount || 0,
        totalTransactions: feesStats.totalTransactions || 0,
        averageTransaction: feesStats.averageAmount || 0,
        totalHostelAllocations: hostelStats.totalAllocations || 0,
        activeHostelAllocations: hostelStats.activeAllocations || 0,
        hostelOccupancyRate: hostelStats.totalAllocations > 0 
          ? ((hostelStats.activeAllocations / hostelStats.totalAllocations) * 100).toFixed(2)
          : 0
      },
      trends: {
        admissions: admissionTrends,
        fees: feeTrends
      },
      recent: {
        admissions: recentAdmissions,
        fees: recentFees
      },
      distribution: {
        courses: courseDistribution
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student dashboard data
router.get('/student', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.studentId;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID not found' });
    }

    // Get student info
    const [students] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = students[0];

    // Get fee history
    const [fees] = await pool.execute(`
      SELECT * FROM fees 
      WHERE student_id = ? 
      ORDER BY payment_date DESC
    `, [studentId]);

    // Get hostel allocation
    const [hostel] = await pool.execute(`
      SELECT * FROM hostel 
      WHERE student_id = ? AND status = 'active'
    `, [studentId]);

    // Calculate fee statistics
    const totalPaid = fees
      .filter(fee => fee.status === 'paid')
      .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);

    const pendingFees = fees
      .filter(fee => fee.status === 'pending')
      .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);

    res.json({
      success: true,
      student,
      fees: {
        history: fees,
        totalPaid,
        pendingFees,
        totalTransactions: fees.length
      },
      hostel: hostel.length > 0 ? hostel[0] : null
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
