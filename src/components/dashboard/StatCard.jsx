import { Card } from 'react-bootstrap';
import { 
  FaTasks, 
  FaCheck, 
  FaClock, 
  FaExclamationCircle, 
  FaUsers, 
  FaTag 
} from 'react-icons/fa';

const StatCard = ({ title, value, icon, color }) => {
  const getIcon = () => {
    switch (icon) {
      case 'tasks':
        return <FaTasks size={24} />;
      case 'check':
        return <FaCheck size={24} />;
      case 'clock':
        return <FaClock size={24} />;
      case 'exclamation':
        return <FaExclamationCircle size={24} />;
      case 'users':
        return <FaUsers size={24} />;
      case 'tag':
        return <FaTag size={24} />;
      default:
        return <FaTasks size={24} />;
    }
  };

  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className={`me-3 p-3 rounded-circle bg-${color} bg-opacity-10 text-${color}`}>
            {getIcon()}
          </div>
          <div>
            <h6 className="text-muted mb-1">{title}</h6>
            <h2 className="mb-0 fw-bold">{value}</h2>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;