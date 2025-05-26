import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';

import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import TaskCard from '../../components/tasks/TaskCard';
import StatCard from '../../components/dashboard/StatCard';
import CategoryDistribution from '../../components/dashboard/CategoryDistribution';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, taskStats, fetchTasks, fetchTaskStats } = useTask();
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [completionData, setCompletionData] = useState(null);
  const navigate = useNavigate();

  // Fetch tasks and stats on component mount
  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, []);

  // Process tasks data for dashboard
  useEffect(() => {
    if (Array.isArray(tasks) && tasks.length > 0) {
      // Tasks due today
      const today = moment().startOf('day');
      const filtered = tasks.filter(task => {
        const dueDate = moment(task.dueDate).startOf('day');
        return dueDate.isSame(today);
      });
      setTodayTasks(filtered);

      // Upcoming tasks (next 7 days, excluding today)
      const upcoming = tasks.filter(task => {
        const dueDate = moment(task.dueDate).startOf('day');
        return dueDate.isAfter(today) && dueDate.diff(today, 'days') <= 7 && !task.completed;
      }).sort((a, b) => moment(a.dueDate).diff(moment(b.dueDate)));
      setUpcomingTasks(upcoming);

      // Tasks completed in last 7 days - data for chart
      prepareCompletionData();
    }
  }, [tasks]);

  const prepareCompletionData = () => {
    // Last 7 days labels
    const labels = [];
    const completedCounts = [];
    const totalCounts = [];

    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      labels.push(date.format('ddd, DD'));

      // Count completed tasks for this day
      const completed = tasks.filter(task => {
        const completedDate = task.completedAt ? moment(task.completedAt).startOf('day') : null;
        return completedDate && completedDate.isSame(date.startOf('day'));
      }).length;
      completedCounts.push(completed);

      // Count total tasks for this day
      const total = tasks.filter(task => {
        const dueDate = moment(task.dueDate).startOf('day');
        return dueDate.isSame(date.startOf('day'));
      }).length;
      totalCounts.push(total);
    }

    setCompletionData({
      labels,
      datasets: [
        {
          label: 'Completed Tasks',
          data: completedCounts,
          backgroundColor: '#5cb85c',
        },
        {
          label: 'Total Tasks',
          data: totalCounts,
          backgroundColor: '#0275d8',
        }
      ],
    });
  };

  return (
    <Container className="fade-in">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">Welcome, {user?.username || 'User'}</h1>
          <p className="text-muted">Here's an overview of your tasks</p>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => navigate('/tasks/new')}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" /> New Task
          </Button>
        </Col>
      </Row>

      {/* Stats Overview */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3 mb-lg-0">
          <StatCard 
            title="Total Tasks" 
            value={taskStats.total} 
            icon="tasks" 
            color="primary" 
          />
        </Col>
        <Col md={6} lg={3} className="mb-3 mb-lg-0">
          <StatCard 
            title="Completed" 
            value={taskStats.completed} 
            icon="check" 
            color="success" 
          />
        </Col>
        <Col md={6} lg={3} className="mb-3 mb-lg-0">
          <StatCard 
            title="In Progress" 
            value={taskStats.pending} 
            icon="clock" 
            color="warning" 
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard 
            title="Overdue" 
            value={taskStats.overdue} 
            icon="exclamation" 
            color="danger" 
          />
        </Col>
      </Row>

      {/* Tasks Due Today */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4 mb-lg-0">
          <Card className="h-100">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaCalendarAlt className="me-2 text-primary" />
                  Tasks Due Today
                </h5>
                <Badge bg="primary" pill>{todayTasks.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {todayTasks.length > 0 ? (
                <div className="task-list">
                  {todayTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="mb-0 text-muted">No tasks due today</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FaCheckCircle className="me-2 text-success" />
                Weekly Completion
              </h5>
            </Card.Header>
            <Card.Body>
              {completionData ? (
                <Bar 
                  data={completionData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                  height={220}
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

      {/* Upcoming Tasks and Categories */}
      <Row>
        <Col lg={8} className="mb-4 mb-lg-0">
          <Card className="h-100">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaCalendarAlt className="me-2 text-primary" />
                  Upcoming Tasks
                </h5>
                <Badge bg="primary" pill>{upcomingTasks.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {upcomingTasks.length > 0 ? (
                <div className="task-list">
                  {upcomingTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="mb-0 text-muted">No upcoming tasks in the next 7 days</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FaExclamationTriangle className="me-2 text-warning" />
                Popular Categories
              </h5>
            </Card.Header>
            <Card.Body>
              <CategoryDistribution tasks={tasks} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;