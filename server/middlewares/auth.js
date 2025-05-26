import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findByPk(decoded.id);
    
    // Check if user exists and is active
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.active) {
      return res.status(403).json({ message: 'Account is deactivated, please contact an administrator' });
    }
    
    // Add user to request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};


// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin privileges required' });
  }
  
  next();
};

// Middleware to create audit log
export const auditLogger = (action) => {
  return (req, res, next) => {
    // Store original end method
    const originalEnd = res.end;
    
    // Override end method
    res.end = function(chunk, encoding) {
      // Call original end method
      originalEnd.call(this, chunk, encoding);
      
      // Check if response is successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log action
        const logData = {
          action,
          userId: req.user?.id,
          ipAddress: req.ip,
          requestMethod: req.method,
          requestUrl: req.originalUrl,
          requestBody: req.body,
          responseStatus: res.statusCode
        };
        
        // In a production app, save to database
        console.log('AUDIT LOG:', JSON.stringify(logData));
      }
    };
    
    next();
  };
};