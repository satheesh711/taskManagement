import express from 'express';
import { verifyToken, auditLogger } from '../middlewares/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const user = req.user;
    
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
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auditLogger('update_profile'), async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update username if provided
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      
      user.username = username;
    }
    
    // Update password if provided
    if (newPassword && currentPassword) {
      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      user.password = newPassword;
    }
    
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
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;