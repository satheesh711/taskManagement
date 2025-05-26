import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch all tasks for the user
  const fetchTasks = async (filters = {}) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskmanagement-akqj.onrender.com/api/tasks?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include if your route requires auth
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);

    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch task statistics
  const fetchTaskStats = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://taskmanagement-akqj.onrender.com/api/tasks/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // if auth is needed
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch task stats');
      }

      const data = await response.json();
      setTaskStats(data);

    } catch (err) {
      console.error('Error fetching task stats:', err);
    }
  };

  // Get a single task by ID
  const getTask = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`https://taskmanagement-akqj.onrender.com/api/tasks/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // include if auth is required
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch task');
      }

      const data = await response.json();
      return data;

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (taskData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://taskmanagement-akqj.onrender.com/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // if your API requires auth
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);

      fetchTaskStats();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a task
  const updateTask = async (id, taskData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`https://taskmanagement-akqj.onrender.com/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // if your API requires auth
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));

      fetchTaskStats();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`https://taskmanagement-akqj.onrender.com/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // include if API requires authentication
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== id));

      fetchTaskStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark task as complete/incomplete
  const toggleTaskCompletion = async (id, completed) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`https://taskmanagement-akqj.onrender.com/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // include if required
        },
        body: JSON.stringify({ completed })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task status');
      }

      const updatedTask = await response.json();

      setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));

      fetchTaskStats();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    tasks,
    taskStats,
    loading,
    error,
    fetchTasks,
    fetchTaskStats,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};