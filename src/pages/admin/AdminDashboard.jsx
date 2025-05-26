import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaTasks, FaChartLine } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import StatCard from '../../components/dashboard/StatCard';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    taskCategories: [],
    userRegistrations: []
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch admin statistics
    const fetchStats = async () => {
      try {
        // In a real app, this would be an API call
        try {
  const response = await fetch('http://localhost:5000/api/admin/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    //   Include authorization if needed
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin stats');
  }

  const data = await response.json();
  setStats(data);
} catch (error) {
  console.error('Error fetching stats:', error.message);
}

        
        // For demonstration, we'll use mock data
        // setStats({
        //   totalUsers: 85,
        //   activeUsers: 62,
        //   totalTasks: 428,
        //   completedTasks: 312,
        //   taskCategories: [
        //     { category: 'Work', count: 142 },
        //     { category: 'Personal', count: 97 },
        //     { category: 'Study', count: 86 },
        //     { category: 'Health', count: 65 },
        //     { category: 'Finance', count: 38 }
        //   ],
        //   userRegistrations: [
        //     { month: 'Jan', count: 5 },
        //     { month: 'Feb', count: 8 },
        //     { month: 'Mar', count: 12 },
        //     { month: 'Apr', count: 10 },
        //     { month: 'May', count: 15 },
        //     { month: 'Jun', count: 20 }
        //   ]
        // });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // Prepare chart data
  const userChartData = {
    labels: stats.userRegistrations.map(item => item.month),
    datasets: [
      {
        label: 'New Users',
        data: stats.userRegistrations.map(item => item.count),
        fill: false,
        backgroundColor: 'rgba(2, 117, 216, 0.8)',
        borderColor: 'rgba(2, 117, 216, 0.8)',
      }
    ],
  };
  
  const categoryChartData = {
    labels: stats.taskCategories.map(item => item.category),
    datasets: [
      {
        label: 'Task Count',
        data: stats.taskCategories.map(item => item.count),
        backgroundColor: [
          'rgba(2, 117, 216, 0.7)',
          'rgba(92, 184, 92, 0.7)',
          'rgba(240, 173, 78, 0.7)',
          'rgba(217, 83, 79, 0.7)',
          'rgba(91, 192, 222, 0.7)'
        ],
      }
    ],
  };
  
  return (
    <Container className="py-4 fade-in">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3 mb-lg-0">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon="users" 
            color="primary" 
          />
        </Col>
        <Col lg={3} md={6} className="mb-3 mb-lg-0">
          <StatCard 
            title="Active Users" 
            value={stats.activeUsers} 
            icon="users" 
            color="success" 
          />
        </Col>
        <Col lg={3} md={6} className="mb-3 mb-lg-0">
          <StatCard 
            title="Total Tasks" 
            value={stats.totalTasks} 
            icon="tasks" 
            color="warning" 
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard 
            title="Completed Tasks" 
            value={stats.completedTasks} 
            icon="check" 
            color="info" 
          />
        </Col>
      </Row>
      
      {/* Charts */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaUsers className="me-2 text-primary" />
                  User Registrations
                </h5>
              </div>
            </Card.Header>
            <Card.Body>
              {stats.userRegistrations.length > 0 ? (
                <Line 
                  data={userChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                  height={240}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted">No data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaChartLine className="me-2 text-primary" />
                  Most Popular Categories
                </h5>
              </div>
            </Card.Header>
            <Card.Body>
              {stats.taskCategories.length > 0 ? (
                <Bar 
                  data={categoryChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                  height={240}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted">No data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;