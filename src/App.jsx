import { useEffect, useState } from 'react'
import Loader from './components/common/Loader';


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
    <div className="App">
      <h1>Welcome to the App</h1>
    </div>
  );
}

export default App;