import express from 'express';
import { Op } from 'sequelize';
import Task from '../models/Task.js';
import { verifyToken, auditLogger } from '../middlewares/auth.js';
import sequelize from '../config/database.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// @route   GET /api/tasks
// @desc    Get all tasks for the user
// @access  Private
router.get('/', async (req, res) => {
  try {
    

    const { category, status, search, sortBy, sortDir } = req.query;
    const userId = req.user.id;
    
    // Build query conditions
    const whereConditions = { user_id: userId };
    
    if (category) {
      whereConditions.category = category;
    }
    
    if (status === 'completed') {
      whereConditions.completed = true;
    } else if (status === 'pending') {
      whereConditions.completed = false;
    }
    
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Build sort options
    const order = [];
    if (sortBy) {
      const direction = sortDir === 'desc' ? 'DESC' : 'ASC';
      order.push([sortBy, direction]);
    } else {
      // Default sort by due date
      order.push(['due_date', 'ASC']);
    }
    
    // Fetch tasks
    const tasks = await Task.findAll({
      where: whereConditions,
      order,
      attributes: [
        'id', 'title', 'description', 'category', 
        'due_date', 'completed', 'completed_at',
        'created_at', 'updated_at'
      ]
    });
    
    // Transform to camelCase for frontend
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.due_date,
      completed: task.completed,
      completedAt: task.completed_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
    
    return res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Total tasks
    const total = await Task.count({ where: { user_id: userId } });
    
    // Completed tasks
    const completed = await Task.count({ 
      where: { 
        user_id: userId,
        completed: true 
      } 
    });
    
    // Pending tasks
    const pending = await Task.count({ 
      where: { 
        user_id: userId,
        completed: false 
      } 
    });
    
    // Overdue tasks
    const overdue = await Task.count({ 
      where: { 
        user_id: userId,
        completed: false,
        due_date: { [Op.lt]: now }
      } 
    });
    
    return res.json({ total, completed, pending, overdue });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const task = await Task.findOne({ 
      where: { 
        id: taskId,
        user_id: userId 
      }
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Transform to camelCase for frontend
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.due_date,
      completed: task.completed,
      completedAt: task.completed_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
    
    return res.json(formattedTask);
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auditLogger('create_task'), async (req, res) => {
  try {
    const { title, description, category, dueDate } = req.body;
    const userId = req.user.id;
    
    // Create task
    const task = await Task.create({
      title,
      description,
      category,
      due_date: dueDate,
      user_id: userId
    });
    
    // Transform to camelCase for frontend
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.due_date,
      completed: task.completed,
      completedAt: task.completed_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
    
    return res.status(201).json(formattedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auditLogger('update_task'), async (req, res) => {
  try {
    const { title, description, category, dueDate, completed } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;
    
    // Find task
    const task = await Task.findOne({ 
      where: { 
        id: taskId,
        user_id: userId 
      } 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update task
    task.title = title;
    task.description = description;
    task.category = category;
    task.due_date = dueDate;
    
    // Only update completed status if it's explicitly included
    if (completed !== undefined) {
      task.completed = completed;
    }
    
    await task.save();
    
    // Transform to camelCase for frontend
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.due_date,
      completed: task.completed,
      completedAt: task.completed_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
    
    return res.json(formattedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auditLogger('delete_task'), async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    
    // Find task
    const task = await Task.findOne({ 
      where: { 
        id: taskId,
        user_id: userId 
      } 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Delete task
    await task.destroy();
    
    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/tasks/:id/status
// @desc    Update task completion status
// @access  Private
router.patch('/:id/status', auditLogger('update_task_status'), async (req, res) => {
  try {
    const { completed } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;
    
    if (completed === undefined) {
      return res.status(400).json({ message: 'Completed status is required' });
    }
    
    // Find task
    const task = await Task.findOne({ 
      where: { 
        id: taskId,
        user_id: userId 
      } 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update status
    task.completed = completed;
    await task.save();
    
    // Transform to camelCase for frontend
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.due_date,
      completed: task.completed,
      completedAt: task.completed_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
    
    return res.json(formattedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;