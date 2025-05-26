import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Task = sequelize.define('task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  underscored: true,
  hooks: {
    beforeUpdate: async (task) => {
      // If task is marked as completed, set completed_at date
      if (task.changed('completed') && task.completed) {
        task.completed_at = new Date();
      }
      // If task is marked as not completed, clear completed_at date
      if (task.changed('completed') && !task.completed) {
        task.completed_at = null;
      }
    }
  }
});

// Set up associations
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });

export default Task;