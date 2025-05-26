import { useState } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaTasks, FaChartBar, FaSignOutAlt, FaUsers, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeNav = () => setExpanded(false);

  if (!user) {
    return (
      <Navbar bg="white" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
            SmartTask
          </Navbar.Brand>
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar bg="white" expand="lg" expanded={expanded} onToggle={setExpanded} className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          SmartTask
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard" onClick={closeNav}>
              <FaChartBar className="me-1" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/tasks" onClick={closeNav}>
              <FaTasks className="me-1" /> Tasks
            </Nav.Link>
            <Nav.Link as={Link} to="/tasks/new" onClick={closeNav}>
              <FaPlus className="me-1" /> New Task
            </Nav.Link>
            {user.role === 'admin' && (
              <Nav.Link as={Link} to="/admin/users" onClick={closeNav}>
                <FaUsers className="me-1" /> Users
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-primary" id="dropdown-profile">
                <FaUserCircle className="me-1" /> {user.username || 'Profile'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/profile" onClick={closeNav}>Profile</Dropdown.Item>
                {user.role === 'admin' && (
                  <Dropdown.Item as={Link} to="/admin" onClick={closeNav}>Admin Dashboard</Dropdown.Item>
                )}
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => { closeNav(); handleLogout(); }}>
                  <FaSignOutAlt className="me-1" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;