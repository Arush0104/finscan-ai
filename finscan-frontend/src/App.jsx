import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setUser({ token });
    setChecking(false);
  }, []);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDocuments(res.data.documents);
    } catch (err) {
      console.error('Failed to fetch documents');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:5000/api/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadMsg('File uploaded successfully!');
      fetchDocuments(); 
    } catch (err) {
      setUploadMsg(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setDocuments([]);
  };

  if (checking) return null;
  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-medium">FinScan</h1>
          <button onClick={handleLogout} className="text-sm text-gray-500 underline">
            Log out
          </button>
        </div>

        {/* Upload box */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
          <h2 className="font-medium mb-1">Upload a bank statement</h2>
          <p className="text-sm text-gray-500 mb-4">PDF or CSV files, max 10MB</p>

          <label className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg h-24 cursor-pointer hover:border-gray-400 transition-colors">
            <span className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Click to choose a file'}
            </span>
            <input
              type="file"
              accept=".pdf,.csv"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {uploadMsg && (
            <p className={`text-sm mt-3 ${uploadMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
              {uploadMsg}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-medium">Uploaded documents</h2>
          </div>

          {documents.length === 0 ? (
            <p className="text-sm text-gray-400 p-6">No documents yet. Upload one above.</p>
          ) : (
            <ul>
              {documents.map(doc => (
                <li key={doc.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{doc.filename}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    doc.status === 'pending'
                      ? 'bg-yellow-50 text-yellow-600'
                      : doc.status === 'processed'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {doc.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;