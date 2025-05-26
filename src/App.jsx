import { useEffect, useState } from 'react'
import Loader from './components/common/Loader';
import { Route, Routes } from 'react-router-dom';
import Register from './pages/auth/Register';
import { AuthProvider } from './context/AuthContext';


function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthProvider >
      <Routes>
        <Route path='/' element={<Register />} />
        {/* <Route path='/login' element={<Login />} /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App;