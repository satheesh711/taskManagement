import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaCheck, FaRedo, FaCalendarAlt, FaTag, FaClock } from 'react-icons/fa';
import moment from 'moment';

import { useTask } from '../../context/TaskContext';
import Loader from '../../components/common/Loader';

const TaskView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTask, deleteTask, toggleTaskCompletion, loading } = useTask();
  
  const [task, setTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskLoading, setTaskLoading] = useState(true);
  
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskData = await getTask(id);
        setTask(taskData);
      } catch (err) {
        console.error('Error fetching task:', err);
      } finally {
        setTaskLoading(false);
      }
    };
    
    fetchTask();
  }, [id]);
  
  const handleToggleCompletion = async () => {
    try {
      const updatedTask = await toggleTaskCompletion(id, !task.completed);
      setTask(updatedTask);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setShowDeleteModal(false);
    }
  };
  
  if (taskLoading) {
    return <Loader />;
  }
  
  if (!task) {
    return (
      <Container className="py-5 text-center">
        <h3>Task not found</h3>
        <Button 
          variant="primary" 
          onClick={() => navigate('/tasks')}
          className="mt-3"
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }
  
  // Determine task status
  const isOverdue = !task.completed && moment(task.dueDate).isBefore(moment(), 'day');
  
  // Format dates
  const formattedDueDate = moment(task.dueDate).format('MMMM D, YYYY');
  const formattedCreatedDate = moment(task.createdAt).format('MMMM D, YYYY');
  const formattedCompletedDate = task.completedAt ? moment(task.completedAt).format('MMMM D, YYYY') : null;
  
  return (
    <Container className="py-4 fade-in">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">{task.title}</h3>
                <div>
                  {task.completed ? (
                    <Badge bg="success" className="me-2">Completed</Badge>
                  ) : isOverdue ? (
                    <Badge bg="danger" className="me-2">Overdue</Badge>
                  ) : (
                    <Badge bg="warning" className="me-2">Pending</Badge>
                  )}
                  
                  {task.category && (
                    <Badge bg="info">{task.category}</Badge>
                  )}
                </div>
              </div>
            </Card.Header>
            
            <Card.Body className="p-4">
              <Row className="mb-4">
                <Col xs={12}>
                  <h5>Description</h5>
                  <p className="mb-0">{task.description || 'No description provided.'}</p>
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col sm={4} className="mb-3 mb-sm-0">
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="text-primary me-2" />
                    <div>
                      <small className="text-muted d-block">Due Date</small>
                      <span>{formattedDueDate}</span>
                    </div>
                  </div>
                </Col>
                
                <Col sm={4} className="mb-3 mb-sm-0">
                  <div className="d-flex align-items-center">
                    <FaClock className="text-secondary me-2" />
                    <div>
                      <small className="text-muted d-block">Created</small>
                      <span>{formattedCreatedDate}</span>
                    </div>
                  </div>
                </Col>
                
                <Col sm={4}>
                  <div className="d-flex align-items-center">
                    <FaTag className="text-info me-2" />
                    <div>
                      <small className="text-muted d-block">Category</small>
                      <span>{task.category || 'Uncategorized'}</span>
                    </div>
                  </div>
                </Col>
              </Row>
              
              {formattedCompletedDate && (
                <Row className="mb-4">
                  <Col>
                    <div className="alert alert-success">
                      <FaCheck className="me-2" />
                      Completed on {formattedCompletedDate}
                    </div>
                  </Col>
                </Row>
              )}
              
              <Row>
                <Col className="d-flex justify-content-between">
                  <Button 
                    variant="outline-danger" 
                    onClick={() => setShowDeleteModal(true)}
                    className="d-flex align-items-center"
                  >
                    <FaTrash className="me-2" /> Delete
                  </Button>
                  
                  <div>
                    <Button
                      variant={task.completed ? "outline-primary" : "outline-success"}
                      className="me-2 d-flex align-items-center"
                      onClick={handleToggleCompletion}
                      disabled={loading}
                    >
                      {task.completed ? (
                        <><FaRedo className="me-2" /> Mark as Pending</>
                      ) : (
                        <><FaCheck className="me-2" /> Mark as Completed</>
                      )}
                    </Button>
                    
                    <Button 
                      variant="primary"
                      onClick={() => navigate(`/tasks/${id}/edit`)}
                      className="d-flex align-items-center"
                    >
                      <FaEdit className="me-2" /> Edit
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this task? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Task'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TaskView;