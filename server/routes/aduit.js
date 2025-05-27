import express from 'express';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';

const router = express.Router();

// Route to get audit logs with user details by user ID
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const logs = await AuditLog.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role'] // Only include necessary fields
        }
      ],
      order: [['created_at', 'DESC']] // Optional: sort by date
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
