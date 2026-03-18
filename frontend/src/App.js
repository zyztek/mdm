import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api';

function App() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/devices`);
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices', error);
      setStatus('Error al conectar con el servidor');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRemoveMDM = async (deviceId) => {
    setLoading(true);
    setStatus('Iniciando proceso de eliminación...');
    setResults(null);
    try {
      // Common MDM/Payjoy packages
      const packages = [
        'com.payjoy.access',
        'com.sec.enterprise.knox.cloudmdm.smdms',
        'com.google.android.apps.work.oobeprox'
      ];
      const response = await axios.post(`${API_BASE}/remove-mdm`, { deviceId, packages });
      setResults(response.data.results);
      setStatus(response.data.status === 'success' ? 'Proceso completado con éxito' : 'Proceso completado con algunas fallas');
    } catch (error) {
      console.error('Error removing MDM', error);
      setStatus('Error durante el proceso de eliminación');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Samsung MDM Remover</h1>
          <p className="text-gray-600">Herramienta de recuperación legítima para dispositivos Samsung</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <Smartphone className="mr-2" /> Dispositivos Detectados
            </h2>
            <button 
              onClick={fetchDevices}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={18} /> Actualizar
            </button>
          </div>

          {devices.length === 0 ? (
            <p className="text-gray-500 italic">No se detectaron dispositivos. Asegúrate de que la depuración USB esté activada.</p>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="border rounded-lg p-4 flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="font-bold text-lg">{device.manufacturer} {device.model}</h3>
                    <p className="text-sm text-gray-500">ID: {device.id}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveMDM(device.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded flex items-center hover:bg-red-700 transition"
                    disabled={loading}
                  >
                    <Trash2 className="mr-2" size={18} /> Eliminar MDM
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {status && (
          <div className={`p-4 rounded-lg mb-8 flex items-center ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {status.includes('Error') ? <AlertCircle className="mr-2" /> : <CheckCircle className="mr-2" />}
            {status}
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Resultados del Proceso</h3>
            <ul className="space-y-2">
              {results.map((res, index) => (
                <li key={index} className="flex justify-between items-center border-b pb-2">
                  <span className="font-mono text-sm">{res.package}</span>
                  <span className={res.status === 'success' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {res.status.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
