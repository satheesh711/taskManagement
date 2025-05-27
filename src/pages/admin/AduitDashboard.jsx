import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaEye, FaSearch, FaFilter, FaUser, FaCalendarAlt, FaGlobe } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const AuditDashboard = ({ userId }) => {
  const [auditData, setAuditData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState(null);
  const userIdFromNavigation = location.state?.userId;

  useEffect(() => {
    if (userIdFromNavigation) {
      setCurrentUserId(userIdFromNavigation);
    }
  }, [userIdFromNavigation]);

  // Fetch audit data for a specific user
  const fetchAuditData = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://taskmanagement-akqj.onrender.com/api/audit/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit data');
      }

      const data = await response.json();
      setAuditData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching audit data:', error);
      // For demo purposes, you can uncomment the mock data below
      // setMockData();
    } finally {
      setLoading(false);
    }
  };

  // Mock data for testing (uncomment if needed)
  // const setMockData = () => {
  //   const mockData = [
  //     {
  //       id: 1,
  //       action: "UPDATE",
  //       table_name: "tasks",
  //       record_id: 23,
  //       old_values: JSON.stringify({ title: "Old Task", status: "pending" }),
  //       new_values: JSON.stringify({ title: "Updated Task", status: "completed" }),
  //       user_id: 2,
  //       ip_address: "192.168.0.1",
  //       created_at: "2025-05-27T11:32:00.000Z",
  //       user: {
  //         id: 2,
  //         name: "Satheesh",
  //         email: "satheesh@example.com",
  //         role: "admin"
  //       }
  //     },
  //     {
  //       id: 2,
  //       action: "CREATE",
  //       table_name: "tasks",
  //       record_id: 24,
  //       old_values: null,
  //       new_values: JSON.stringify({ title: "New Task", status: "pending" }),
  //       user_id: 2,
  //       ip_address: "192.168.0.1",
  //       created_at: "2025-05-27T10:15:00.000Z",
  //       user: {
  //         id: 2,
  //         name: "Satheesh",
  //         email: "satheesh@example.com",
  //         role: "admin"
  //       }
  //     }
  //   ];
  //   setAuditData(mockData);
  //   setFilteredData(mockData);
  // };

useEffect(() => {
  fetchAuditData(currentUserId);
}, [currentUserId]);


  // Filter data based on search and action filter
  useEffect(() => {
    let filtered = auditData;

    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAction) {
      filtered = filtered.filter(item => item.action === filterAction);
    }

    setFilteredData(filtered);
  }, [searchTerm, filterAction, auditData]);

  // Handle user detail view
  const handleViewUserDetails = (auditItem) => {
    setSelectedUser(auditItem);
    setShowUserModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get action badge variant
  const getActionBadgeVariant = (action) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'danger';
      default: return 'secondary';
    }
  };

  // Parse JSON safely
  const parseJSON = (jsonString) => {
    try {
      return JSON.parse(jsonString || '{}');
    } catch {
      return {};
    }
  };

  return (
    <Container className="py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Audit Dashboard</h1>
      </div>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by user, email, table, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button 
            variant="outline-primary" 
            onClick={() => fetchAuditData(currentUserId)}
            disabled={loading}
          >
            <FaFilter className="me-2" />
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Audit Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Audit Log</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredData.length > 0 ? (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Table</th>
                  <th>Record ID</th>
                  <th>IP Address</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <div>
                        <strong>{item.user.name}</strong>
                        <br />
                        <small className="text-muted">{item.user.email}</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getActionBadgeVariant(item.action)}>
                        {item.action}
                      </Badge>
                    </td>
                    <td>
                      <code>{item.table_name}</code>
                    </td>
                    <td>{item.record_id}</td>
                    <td>
                      <FaGlobe className="me-1 text-muted" />
                      {item.ip_address}
                    </td>
                    <td>
                      <FaCalendarAlt className="me-1 text-muted" />
                      {formatDate(item.created_at)}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewUserDetails(item)}
                      >
                        <FaEye className="me-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted mb-0">No audit data found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* User Details Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2 text-primary" />
            Audit Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Row>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h6 className="mb-0">User Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Name:</strong> {selectedUser.user.name}
                    </div>
                    <div className="mb-3">
                      <strong>Email:</strong> {selectedUser.user.email}
                    </div>
                    <div className="mb-3">
                      <strong>Role:</strong> 
                      <Badge bg="info" className="ms-2">
                        {selectedUser.user.role}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <strong>User ID:</strong> {selectedUser.user.id}
                    </div>
                    <div className="mb-3">
                      <strong>IP Address:</strong> {selectedUser.ip_address}
                    </div>
                    <div>
                      <strong>Timestamp:</strong> {formatDate(selectedUser.created_at)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h6 className="mb-0">Action Details</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Action:</strong> 
                      <Badge bg={getActionBadgeVariant(selectedUser.action)} className="ms-2">
                        {selectedUser.action}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <strong>Table:</strong> <code>{selectedUser.table_name}</code>
                    </div>
                    <div className="mb-3">
                      <strong>Record ID:</strong> {selectedUser.record_id}
                    </div>
                    
                    {selectedUser.old_values && (
                      <div className="mb-3">
                        <strong>Old Values:</strong>
                        <div className="mt-2">
                          <pre className="bg-light p-2 rounded small">
                            {JSON.stringify(parseJSON(selectedUser.old_values), null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {selectedUser.new_values && (
                      <div>
                        <strong>New Values:</strong>
                        <div className="mt-2">
                          <pre className="bg-light p-2 rounded small">
                            {JSON.stringify(parseJSON(selectedUser.new_values), null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AuditDashboard;