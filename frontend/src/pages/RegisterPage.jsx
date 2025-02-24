import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api'; // Asegúrate de que api.js maneja las peticiones HTTP

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [docentes, setDocentes] = useState([]); // ✅ Lista de docentes
  const [idDocente, setIdDocente] = useState(''); // ✅ ID del docente seleccionado
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Cargar lista de docentes cuando se selecciona el rol "DOCENTE"
  useEffect(() => {
    if (role === 'DOCENTE') {
      fetchDocentes();
    }
  }, [role]);

  const fetchDocentes = async () => {
    try {
      const response = await api.get('/auth/docentes'); // Endpoint en el backend
      setDocentes(response.data);
    } catch (error) {
      console.error('Error al obtener docentes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ Validar que el docente sea seleccionado si el rol es "DOCENTE"
      if (role === 'DOCENTE' && !idDocente) {
        setError('Debes seleccionar un docente.');
        setLoading(false);
        return;
      }

      await authService.register(email, password, role, idDocente); // ✅ Se envía `idDocente`
      alert('Registro exitoso. Ahora inicia sesión con tus credenciales.');
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Registro de usuario
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">Rol</label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
                <option value="">Selecciona un rol</option>
                <option value="DOCENTE">Docente</option>
                <option value="BIENESTAR_ESTUDIANTIL">Bienestar Estudiantil</option>
              </select>
            </div>

            {/* 🔹 Seleccionar docente si el rol es DOCENTE */}
            {role === 'DOCENTE' && (
              <div>
                <label htmlFor="docente" className="sr-only">Selecciona tu nombre</label>
                <select
                  id="docente"
                  name="docente"
                  value={idDocente}
                  onChange={(e) => setIdDocente(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                >
                  <option value="">Selecciona tu nombre</option>
                  {docentes.map((docente) => (
                    <option key={docente.id_docente} value={docente.id_docente}>
                      {docente.nombres} {docente.apellidos}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
