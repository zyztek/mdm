import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Activity, Database, AlertTriangle, CheckCircle } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api';

function App() {
  const [operations, setOperations] = useState([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });

  const fetchOperations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/operations`);
      setOperations(response.data);
      
      const total = response.data.length;
      const success = response.data.filter(op => op.status === 'success').length;
      const failed = total - success;
      setStats({ total, success, failed });
    } catch (error) {
      console.error('Error fetching operations', error);
    }
  };

  useEffect(() => {
    fetchOperations();
    const interval = setInterval(fetchOperations, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8 flex items-center">
          <LayoutDashboard className="mr-2" /> Admin Panel
        </h1>
        <nav className="space-y-4">
          <a href="#" className="block py-2 px-4 bg-blue-800 rounded">Dashboard</a>
          <a href="#" className="block py-2 px-4 hover:bg-blue-800 rounded transition">Dispositivos</a>
          <a href="#" className="block py-2 px-4 hover:bg-blue-800 rounded transition">Reportes</a>
          <a href="#" className="block py-2 px-4 hover:bg-blue-800 rounded transition">Configuración</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Métricas de Operación - México</h2>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center text-gray-500 mb-2">
              <Activity className="mr-2" size={20} /> Total Operaciones
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center text-gray-500 mb-2">
              <CheckCircle className="mr-2" size={20} /> Exitosas
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.success}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
            <div className="flex items-center text-gray-500 mb-2">
              <AlertTriangle className="mr-2" size={20} /> Fallidas / Parciales
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
          </div>
        </div>

        {/* Operations Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-semibold flex items-center">
            <Database className="mr-2" size={20} /> Historial Reciente
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-4">ID Dispositivo</th>
                <th className="p-4">Operación</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr key={op.id} className="border-b hover:bg-gray-50 transition text-sm">
                  <td className="p-4 font-mono">{op.device_id}</td>
                  <td className="p-4">{op.operation_type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${op.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {op.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(op.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {operations.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No hay operaciones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
