import { Spinner, Container } from 'react-bootstrap';

const Loader = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3">Loading...</p>
      </div>
    </Container>
  );
};

export default Loader;