import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

//diff modules 
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function App() {
  //variables like file input and also for the alog stats
  const [file, setFile] = useState(null);
  const [algo, setAlgo] = useState('huffman');
  const [action, setAction] = useState('compress');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  //keylisten sending file
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStats(null);

    const formData = new FormData();
    formData.append('myFile', file);
    formData.append('algo', algo);
    formData.append('action', action);

    try {
      let url = '';
      if (algo === 'huffman' && action === 'compress') url = 'http://localhost:5000/huffman-compress';
      if (algo === 'huffman' && action === 'decompress') url = 'http://localhost:5000/huffman-decompress';
      if (algo === 'rle' && action === 'compress') url = 'http://localhost:5000/rle-compress';
      if (algo === 'rle' && action === 'decompress') url = 'http://localhost:5000/rle-decompress';

      //goes to backend
      const response = await axios.post(url, formData, {
        responseType: 'blob',
      });

      //using custom headers stats extract krne k liye
      const originalSize = Number(response.headers['x-original-size'] || 0);
      const newSize = Number(response.headers['x-new-size'] || 0);
      const timeTaken = response.headers['x-time-taken'] || 'N/A';

      const compressionRatio = originalSize && newSize
        ? ((newSize / originalSize) * 100).toFixed(2)
        : '0.00';

      setStats({ originalSize, newSize, compressionRatio, timeTaken });

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${action}_output.txt`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Error occurred!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      <div className="container py-5">
        <div className="card shadow p-4 border-0" style={{ background: 'linear-gradient(to right, #1e3c72, #2a5298)', color: '#fff' }}>
          <h2 className="mb-4 text-center fw-bold">FileShrink – Compress or Decompress Files</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="file"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              {file && (
                <small className="text-light">Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</small>
              )}
            </div>

            <div className="row mb-3">
              <div className="col">
                <select className="form-select" value={algo} onChange={(e) => setAlgo(e.target.value)}>
                  <option value="huffman">Huffman Coding</option>
                  <option value="rle">Run Length Encoding</option>
                </select>
              </div>
              <div className="col">
                <select className="form-select" value={action} onChange={(e) => setAction(e.target.value)}>
                  <option value="compress">Compress</option>
                  <option value="decompress">Decompress</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn w-100 text-white fw-semibold" style={{ background: 'linear-gradient(to right, #ff512f, #dd2476)' }} disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                <span>DOWNLOAD</span>
              )}
            </button>
          </form>

          {stats && (
            <div className="mt-4">
              <div className="alert" style={{ backgroundColor: '#1abc9c', color: '#fff' }}>
                File processed in <strong>{stats.timeTaken}</strong>
              </div>
              <div className="alert" style={{ backgroundColor: '#3498db', color: '#fff' }}>
                <strong>Original:</strong> {stats.originalSize} bytes &nbsp;|&nbsp;
                <strong>New:</strong> {stats.newSize} bytes &nbsp;|&nbsp;
                <strong>Ratio:</strong> {stats.compressionRatio}%
              </div>

              <div className="p-3 rounded" style={{ background: '#ffffff', borderRadius: '10px' }}>
                <Bar
                  data={{
                    labels: ['Original Size', 'New Size'],
                    datasets: [
                      {
                        label: 'File Size (bytes)',
                        data: [stats.originalSize, stats.newSize],
                        backgroundColor: ['#ff6e7f', '#bfe9ff'],
                        borderColor: ['#ff6e7f', '#bfe9ff'],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { color: '#333' },
                      },
                      x: {
                        ticks: { color: '#333' },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: { color: '#333' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <footer className="text-center mt-5" style={{ color: '#bbb' }}>
          <hr style={{ borderColor: '#888' }} />
          <p>-------{new Date().getFullYear()} FileShrink-------</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
