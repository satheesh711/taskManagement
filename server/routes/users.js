import express from 'express';
import { verifyToken } from '../middlewares/auth.js';

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

export default router;