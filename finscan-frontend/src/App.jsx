import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then(res => setStatus(res.data.message))
      .catch(() => setStatus('backend not reachable'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-xl font-medium">{status}</h1>
    </div>
  );
}

export default App;