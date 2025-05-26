import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();


// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
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
      role: 'user', // Default role
      active: true
    });
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data (excluding password) and token
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});
 
export default router;