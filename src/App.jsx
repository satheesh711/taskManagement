import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import NavigationBar from './components/layout/NavigationBar';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import TaskList from './pages/tasks/TaskList';
import TaskCreate from './pages/tasks/TaskCreate';
import TaskEdit from './pages/tasks/TaskEdit';
import TaskView from './pages/tasks/TaskView';
import Profile from './pages/profile/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthProvider>
      <TaskProvider>
        <NavigationBar />
        <Container fluid className="py-4 px-3 px-md-4 min-vh-100">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/tasks/new" element={<TaskCreate />} />
              <Route path="/tasks/:id" element={<TaskView />} />
              <Route path="/tasks/:id/edit" element={<TaskEdit />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
        <Footer />
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;