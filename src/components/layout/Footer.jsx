import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-light py-4 mt-auto border-top">
      <Container>
        <Row className="justify-content-between align-items-center">
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">© {year} Smart Task Management App. All rights reserved.</p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="mb-0 text-muted">Version 1.0.0</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;