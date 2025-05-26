import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHome } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Container className="py-5 text-center fade-in">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="mb-4">
            <h1 className="display-1 fw-bold text-primary">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            <p className="text-muted mb-4">
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate(-1)}
                className="d-inline-flex align-items-center"
              >
                <FaArrowLeft className="me-2" /> Go Back
              </Button>
              <Button 
                variant="primary" 
                onClick={() => navigate('/')}
                className="d-inline-flex align-items-center"
              >
                <FaHome className="me-2" /> Go to Dashboard
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;