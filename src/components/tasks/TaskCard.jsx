import { Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaClock, FaCalendarAlt, FaTag } from 'react-icons/fa';
import moment from 'moment';

const TaskCard = ({ task }) => {
  const { id, title, description, dueDate, category, completed } = task;
  
  // Determine if task is overdue
  const isOverdue = !completed && moment(dueDate).isBefore(moment(), 'day');
  
  // Get appropriate class
  let statusClass = '';
  if (completed) {
    statusClass = 'completed';
  } else if (isOverdue) {
    statusClass = 'overdue';
  }
  
  // Get appropriate status badge
  const getStatusBadge = () => {
    if (completed) {
      return <Badge bg="success">Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge bg="danger">Overdue</Badge>;
    }
    return <Badge bg="warning">Pending</Badge>;
  };

  return (
    <Link to={`/tasks/${id}`} className="text-decoration-none">
      <Card className={`task-item mb-2 border-0 border-bottom ${statusClass}`}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className={completed ? 'text-decoration-line-through' : ''}>
                {title}
              </h5>
              <p className="text-muted mb-2 small">
                {description?.length > 80 ? `${description.substring(0, 80)}...` : description}
              </p>
              <div className="d-flex align-items-center small text-muted">
                <FaCalendarAlt className="me-1" />
                <span className="me-3">{moment(dueDate).format('MMM D, YYYY')}</span>
                {category && (
                  <>
                    <FaTag className="me-1 ms-2" />
                    <span>{category}</span>
                  </>
                )}
              </div>
            </div>
            <div>
              {getStatusBadge()}
            </div>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default TaskCard;