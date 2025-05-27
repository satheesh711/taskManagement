import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Modal,
  Alert
} from 'react-bootstrap';
import { FaSearch, FaUserPlus, FaUserEdit, FaUserSlash, FaFileDownload } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import { utils, writeFileXLSX } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real app, this would be an API call
        try {
          const response = await fetch('https://taskmanagement-akqj.onrender.com/api/admin/users', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }

          const data = await response.json();
          setUsers(data);
        } catch (error) {
          console.error('Error fetching users:', error.message);
        }


        // For demonstration, we'll use mock data
        // setUsers([
        //   { id: 1, username: 'john_doe', email: 'john@example.com', active: true, role: 'admin', createdAt: '2023-01-15' },
        //   { id: 2, username: 'jane_smith', email: 'jane@example.com', active: true, role: 'user', createdAt: '2023-02-10' },
        //   { id: 3, username: 'robert_johnson', email: 'robert@example.com', active: true, role: 'user', createdAt: '2023-03-05' },
        //   { id: 4, username: 'emily_wilson', email: 'emily@example.com', active: false, role: 'user', createdAt: '2023-03-20' },
        //   { id: 5, username: 'michael_brown', email: 'michael@example.com', active: true, role: 'user', createdAt: '2023-04-12' },
        // ]);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (users.length) {
      const filtered = users.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);

      // In a real app, this would be an API call
      const token = localStorage.getItem('token');

      const response = await fetch('https://taskmanagement-akqj.onrender.com/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // if your route is protected
        },
        body: JSON.stringify(newUserData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'User creation failed');
      }

      const newUser = await response.json();


      // For demonstration, we'll create mock data
      // const newUser = {
      //   id: users.length + 1,
      //   ...newUserData,
      //   active: true,
      //   createdAt: new Date().toISOString().split('T')[0]
      // };

      setUsers([...users, newUser]);
      setShowAddUserModal(false);
      setNewUserData({
        username: '',
        email: '',
        password: '',
        role: 'user'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      // In a real app, this would be an API call
      const token = localStorage.getItem('token');

const updatedUsers = await fetch(`https://taskmanagement-akqj.onrender.com/api/admin/users/${selectedUser.id}/status`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Include if your route is protected
  },
  body: JSON.stringify({
    active: !selectedUser.active
  })
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Failed to update user status');
}


      // For demonstration, we'll update locally
      // const updatedUsers = users.map(user => {
      //   if (user.id === selectedUser.id) {
      //     return { ...user, active: !user.active };
      //   }
      //   return user;
      // });

      setUsers(updatedUsers);
      setShowDeactivateModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(
      filteredUsers.map(user => ({
        Username: user.username,
        Email: user.email,
        Role: user.role,
        Status: user.active ? 'Active' : 'Inactive',
        'Created At': user.createdAt
      }))
    );
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Users');
    writeFileXLSX(workbook, 'users.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('User List', 14, 22);

    // Define the table structure
    const tableColumn = ["Username", "Email", "Role", "Status", "Created At"];
    const tableRows = filteredUsers.map(user => [
      user.username,
      user.email,
      user.role,
      user.active ? 'Active' : 'Inactive',
      user.createdAt
    ]);

    // Generate PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [2, 117, 216] },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    doc.save('users.pdf');
  };

  return (
    <Container className="py-4 fade-in">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>User Management</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={() => setShowAddUserModal(true)}
            className="d-flex align-items-center"
          >
            <FaUserPlus className="me-2" /> Add User
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Row className="align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </Col>
            <Col md={8} className="text-md-end mt-3 mt-md-0">
              <div className="d-flex flex-wrap justify-content-md-end gap-2">
                <CSVLink
                  data={filteredUsers.map(user => ({
                    Username: user.username,
                    Email: user.email,
                    Role: user.role,
                    Status: user.active ? 'Active' : 'Inactive',
                    'Created At': user.createdAt
                  }))}
                  filename="users.csv"
                  className="btn btn-outline-primary"
                >
                  <FaFileDownload className="me-1" /> CSV
                </CSVLink>
                <Button variant="outline-primary" onClick={exportToExcel}>
                  <FaFileDownload className="me-1" /> Excel
                </Button>
                <Button variant="outline-primary" onClick={exportToPDF}>
                  <FaFileDownload className="me-1" /> PDF
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id} onClick={() => navigate('/aduitdashboard', { state: { userId: user.id } })}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={user.role === 'admin' ? 'primary' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={user.active ? 'success' : 'danger'}>
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>{user.createdAt}</td>
                      <td className="text-end">
                        <Button
                          variant={user.active ? "outline-danger" : "outline-success"}
                          size="sm"
                          className="d-flex align-items-center ms-auto"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeactivateModal(true);
                          }}
                        >
                          <FaUserSlash className="me-1" />
                          {user.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add User Modal */}
      <Modal show={showAddUserModal} onHide={() => setShowAddUserModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={newUserData.username}
                onChange={handleNewUserChange}
                placeholder="Enter username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUserData.email}
                onChange={handleNewUserChange}
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={newUserData.password}
                onChange={handleNewUserChange}
                placeholder="Create password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={newUserData.role}
                onChange={handleNewUserChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddUserModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddUser}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Deactivate/Activate User Modal */}
      <Modal show={showDeactivateModal} onHide={() => setShowDeactivateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser?.active ? 'Deactivate' : 'Activate'} User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser?.active ? (
            <p>Are you sure you want to deactivate user <strong>{selectedUser?.username}</strong>? They will no longer be able to access the system.</p>
          ) : (
            <p>Are you sure you want to activate user <strong>{selectedUser?.username}</strong>? This will restore their access to the system.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeactivateModal(false)}>
            Cancel
          </Button>
          <Button
            variant={selectedUser?.active ? 'danger' : 'success'}
            onClick={handleToggleUserStatus}
            disabled={loading}
          >
            {loading ? 'Processing...' : selectedUser?.active ? 'Deactivate User' : 'Activate User'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;