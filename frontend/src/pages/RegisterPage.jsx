import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [docentes, setDocentes] = useState([]);
  const [idDocente, setIdDocente] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar lista de docentes cuando se selecciona el rol "DOCENTE"
  useEffect(() => {
    if (role === 'DOCENTE') {
      fetchDocentes();
    }
  }, [role]);

  const fetchDocentes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/docentes');
      setDocentes(response.data);
    } catch (error) {
      console.error('Error al obtener docentes:', error);
      setError('No se pudo cargar la lista de docentes. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (role === 'DOCENTE' && !idDocente) {
      setError('Debe seleccionar un docente');
      setLoading(false);
      return;
    }

    if (!role) {
      setError('Debe seleccionar un rol');
      setLoading(false);
      return;
    }

    try {
      await authService.register(email, password, role, idDocente);
      setSuccess('¡Registro exitoso! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al registrarse. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Panel lateral con ilustración SVG - Similar al Login */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-700 opacity-90"></div>

        {/* SVG de fondo con patrón de puntos */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
            <circle id="pattern-circle" cx="10" cy="10" r="1.6257413380501518" fill="#fff"></circle>
          </pattern>
          <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
        </svg>

        {/* Ilustración SVG para registro */}
        <div className="relative z-10 p-8 max-w-lg">
          <svg
            viewBox="0 0 500 400"
            className="w-full h-auto"
            aria-hidden="true"
          >
            {/* Fondo */}
            <rect width="500" height="400" fill="none" />

            {/* Formulario/Documento */}
            <g transform="translate(250, 200)">
              <rect x="-100" y="-130" width="200" height="260" rx="10" fill="#f0f4ff" />
              <rect x="-80" y="-110" width="160" height="20" rx="4" fill="#d1dafe" />
              <rect x="-80" y="-80" width="160" height="20" rx="4" fill="#d1dafe" />
              <rect x="-80" y="-50" width="160" height="20" rx="4" fill="#d1dafe" />
              <rect x="-80" y="-20" width="80" height="20" rx="4" fill="#6875f5" />
              <rect x="-80" y="10" width="160" height="1" fill="#d1dafe" />
              <rect x="-80" y="30" width="160" height="20" rx="4" fill="#d1dafe" />
              <rect x="-80" y="60" width="160" height="20" rx="4" fill="#d1dafe" />
              <rect x="-80" y="90" width="80" height="20" rx="4" fill="#6875f5" />
            </g>

            {/* Persona */}
            <g transform="translate(100, 150)">
              <circle cx="0" cy="-50" r="30" fill="#6875f5" />
              <path d="M-15,-40 L15,-40" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <path d="M-10,-30 L10,-30" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <rect x="-20" y="-20" width="40" height="70" rx="5" fill="#6875f5" />
              <rect x="-30" y="-15" width="10" height="40" rx="2" fill="#6875f5" />
              <rect x="20" y="-15" width="10" height="40" rx="2" fill="#6875f5" />
            </g>

            {/* Candado (seguridad) */}
            <g transform="translate(400, 150)">
              <rect x="-25" y="-10" width="50" height="60" rx="5" fill="#4f46e5" />
              <path d="M-15,-10 L-15,-30 A15,15 0 0,1 15,-30 L15,-10" fill="none" stroke="#4f46e5" strokeWidth="8" />
              <circle cx="0" cy="20" r="10" fill="#fff" />
              <rect x="-3" y="15" width="6" height="15" rx="2" fill="#4f46e5" />
            </g>

            {/* Universidad/Edificio */}
            <g transform="translate(250, 350)">
              <rect x="-80" y="-60" width="160" height="60" fill="#1e3a8a" />
              <rect x="-70" y="-50" width="15" height="25" fill="#bfdbfe" />
              <rect x="-40" y="-50" width="15" height="25" fill="#bfdbfe" />
              <rect x="-10" y="-50" width="15" height="25" fill="#bfdbfe" />
              <rect x="20" y="-50" width="15" height="25" fill="#bfdbfe" />
              <rect x="50" y="-50" width="15" height="25" fill="#bfdbfe" />
              <rect x="-70" y="-15" width="15" height="15" fill="#bfdbfe" />
              <rect x="-40" y="-15" width="15" height="15" fill="#bfdbfe" />
              <rect x="50" y="-15" width="15" height="15" fill="#bfdbfe" />
              <rect x="-95" y="-80" width="190" height="20" fill="#1e3a8a" />
              <path d="M-105,-80 L0,-110 L105,-80 Z" fill="#1e3a8a" />
            </g>
          </svg>

          <div className="text-white mt-8">
            <h1 className="text-3xl font-bold mb-4">Registro de Usuario</h1>
            <p className="text-xl opacity-80">
              Únase al Sistema de Predicción de Deserción
            </p>
            <ul className="mt-6 space-y-2 list-disc list-inside opacity-80">
              <li>Seguimiento personalizado de estudiantes</li>
              <li>Acceso a herramientas de análisis académico</li>
              <li>Intervención temprana para reducir la deserción</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario de registro */}
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 md:w-1/2">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center animate-pulse">
              <svg className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 md:hidden">
            Registro de Usuario
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 md:hidden">
            Complete el formulario para crear su cuenta
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10 
               border border-transparent hover:border-indigo-500 
               transition-all duration-300 ease-in-out
               hover:shadow-lg hover:shadow-indigo-300
               hover:transform hover:scale-[1.02]">

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6 animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-6 animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">¡Éxito!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{success}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           transition-all duration-300 sm:text-sm
                           hover:border-indigo-300"
                  placeholder="usuario@universidad.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           transition-all duration-300 sm:text-sm
                           hover:border-indigo-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           transition-all duration-300 sm:text-sm
                           hover:border-indigo-300"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           transition-all duration-300 sm:text-sm
                           hover:border-indigo-300"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Seleccione su rol</option>
                  <option value="DOCENTE">Docente</option>
                  <option value="BIENESTAR_ESTUDIANTIL">Bienestar Estudiantil</option>
                </select>
              </div>

              {role === 'DOCENTE' && (
                <div className="space-y-2 animate-fadeIn">
                  <label htmlFor="docente" className="block text-sm font-medium text-gray-700">
                    Seleccione su nombre
                  </label>
                  <select
                    id="docente"
                    name="docente"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                             transition-all duration-300 sm:text-sm
                             hover:border-indigo-300"
                    value={idDocente}
                    onChange={(e) => setIdDocente(e.target.value)}
                    disabled={loading || docentes.length === 0}
                  >
                    <option value="">Seleccione su nombre</option>
                    {docentes.map((docente) => (
                      <option key={docente.id_docente} value={docente.id_docente}>
                        {docente.nombres} {docente.apellidos}
                      </option>
                    ))}
                  </select>
                  {docentes.length === 0 && role === 'DOCENTE' && !loading && !error && (
                    <p className="text-xs text-yellow-600 mt-1">
                      No se encontraron docentes. Por favor, contacte al administrador.
                    </p>
                  )}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                           rounded-md text-white bg-indigo-600 
                           transition-all duration-300 ease-in-out
                           hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transform hover:-translate-y-1 hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </>
                  ) : 'Registrarse'}
                </button>
              </div>
            </form>

            <div className="mt-6 flex items-center justify-center">
              <div className="text-sm">
                <p className="text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="font-medium text-indigo-600 hover:text-indigo-500 
                              transition-colors duration-200
                              focus:outline-none focus:underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Sistema de Predicción de Deserción | Universidad Espe</p>
        </div>
      </div>
    </div>
  );
};

// Agregar estilos globales (si no están ya añadidos en otro lugar)
if (!document.getElementById('register-animations')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'register-animations';
  styleTag.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    
    .animate-pulse {
      animation: pulse 2s infinite;
    }
  `;
  document.head.appendChild(styleTag);
}

export default RegisterPage;