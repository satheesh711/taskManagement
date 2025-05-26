import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTask } from '../../context/TaskContext';
import Loader from '../../components/common/Loader';

const TaskEdit = () => {
  const { id } = useParams();
  const { getTask, updateTask, loading, error } = useTask();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    dueDate: new Date(),
    completed: false
  });
  const [loadingTask, setLoadingTask] = useState(true);
  const [validated, setValidated] = useState(false);
  
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskData = await getTask(id);
        setFormData({
          ...taskData,
          dueDate: new Date(taskData.dueDate)
        });
      } catch (err) {
        console.error('Error fetching task:', err);
      } finally {
        setLoadingTask(false);
      }
    };
    
    fetchTask();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      await updateTask(id, formData);
      navigate(`/tasks/${id}`);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };
  
  if (loadingTask) {
    return <Loader />;
  }
  
  return (
    <Container className="py-4 fade-in">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-3">
              <h3 className="mb-0">Edit Task</h3>
            </Card.Header>
            
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Task Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a task title.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Enter task description"
                  />
                </Form.Group>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3 mb-md-0">
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        type="text"
                        name="category"
                        value={formData.category || ''}
                        onChange={handleChange}
                        placeholder="E.g., Work, Personal, Study"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Due Date</Form.Label>
                      <DatePicker
                        selected={formData.dueDate}
                        onChange={handleDateChange}
                        className="form-control"
                        dateFormat="MMMM d, yyyy"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="completed-checkbox"
                    name="completed"
                    label="Mark as completed"
                    checked={formData.completed}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button 
                    variant="outline-secondary" 
                    className="me-2"
                    onClick={() => navigate(`/tasks/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
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

export default TaskEdit;