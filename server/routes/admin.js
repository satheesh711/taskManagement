import express from 'express';
import { Op } from 'sequelize';
import { verifyToken, isAdmin, auditLogger } from '../middlewares/auth.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import sequelize from '../config/database.js';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(verifyToken, isAdmin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 'username', 'email', 'role', 'active', 
        'last_login', 'created_at', 'updated_at'
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Transform to camelCase for frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
    
    return res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get a specific user
// @access  Private (Admin only)
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'username', 'email', 'role', 'active', 
        'last_login', 'created_at', 'updated_at'
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Transform to camelCase for frontend
    const formattedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
    
    return res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/users', auditLogger('admin_create_user'), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { username }] 
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user',
      active: true
    });
    
    // Return user data (excluding password)
    return res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id/status
// @desc    Activate or deactivate a user
// @access  Private (Admin only)
router.patch('/users/:id/status', auditLogger('admin_update_user_status'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({ message: 'Active status is required' });
    }
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deactivating your own account
    if (user.id === req.user.id && !active) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }
    
    // Update status
    user.active = active;
    await user.save();
    
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
      lastLogin: user.last_login,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.count();
    
    // Active users
    const activeUsers = await User.count({ where: { active: true } });
    
    // Total tasks
    const totalTasks = await Task.count();
    
    // Completed tasks
    const completedTasks = await Task.count({ where: { completed: true } });
    
    // Get user registrations by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userRegistrations = await User.findAll({
      attributes: [
        [sequelize.fn('date_format', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: sixMonthsAgo }
      },
      group: [sequelize.fn('date_format', sequelize.col('created_at'), '%Y-%m')],
      order: [[sequelize.fn('date_format', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
      raw: true
    });
    
    // Popular task categories
    const taskCategories = await Task.findAll({
      attributes: [
        'category',
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      where: {
        category: { [Op.ne]: null }
      },
      group: ['category'],
      order: [[sequelize.fn('count', sequelize.col('id')), 'DESC']],
      limit: 5,
      raw: true
    });
    
    return res.json({
      totalUsers,
      activeUsers,
      totalTasks,
      completedTasks,
      userRegistrations: userRegistrations.map(item => ({
        month: item.month,
        count: parseInt(item.count)
      })),
      taskCategories: taskCategories.map(item => ({
        category: item.category,
        count: parseInt(item.count)
      }))
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;