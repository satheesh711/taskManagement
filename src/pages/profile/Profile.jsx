import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaKey } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      setProfileData({
        ...profileData,
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    // Password validation if changing password
    if (profileData.newPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        setMessage({ 
          type: 'danger', 
          text: 'New passwords do not match' 
        });
        setLoading(false);
        return;
      }
      
      if (!profileData.currentPassword) {
        setMessage({ 
          type: 'danger', 
          text: 'Current password is required to change password' 
        });
        setLoading(false);
        return;
      }
    }
    
    try {
      // Prepare data for update
      const updateData = {
        username: profileData.username,
      };
      
      // Only include password fields if user is changing password
      if (profileData.newPassword) {
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }
      
      await updateProfile(updateData);
      
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully' 
      });
      
      // Reset password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.toString() 
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-4 fade-in">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              <h3 className="mb-0">Profile Settings</h3>
            </Card.Header>
            
            <Card.Body className="p-4">
              {message.text && (
                <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                  {message.text}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaUser />
                    </span>
                    <Form.Control
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaEnvelope />
                    </span>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                    />
                  </div>
                  <Form.Text className="text-muted">
                    Email address cannot be changed.
                  </Form.Text>
                </Form.Group>
                
                <h5 className="mb-3">Change Password</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaKey />
                    </span>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={profileData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={profileData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;