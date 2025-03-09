import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useParams } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const { token } = useParams(); // Captura el token de la URL
  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [, setToken] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Detect password reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    if (resetToken) {
      setIsResettingPassword(true);
      setToken(resetToken);
    }
  }, [location]);

  // Load remembered email if "Remember Me" was enabled
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const rememberedState = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && rememberedState) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.setItem('rememberMe', 'false');
      }

      const result = await onLogin(email, password);
      if (result?.token) {
        setSuccess('¡Inicio de sesión exitoso!');
        setTimeout(() => {
          setSuccess('');
          navigate('/');
        }, 2000);
      } else {
        throw new Error('Error al iniciar sesión.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al iniciar sesión. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset request
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.forgotPassword(resetEmail);
      setSuccess('Se ha enviado un enlace de recuperación a su correo.');
      setTimeout(() => {
        setIsResettingPassword(false);
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('No se pudo enviar el correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  // Submit new password after reset
  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validar que haya un token y una nueva contraseña
    if (!token) {
      setError('El enlace de restablecimiento no es válido.');
      setLoading(false);
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess('✅ Contraseña cambiada correctamente. Redirigiendo...');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('❌ Error al cambiar la contraseña:', error);

      // Si el backend envía un mensaje de error, lo mostramos
      setError(error.response?.data?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
    console.log("🔑 Token recibido:", token);
    console.log("🔐 Nueva contraseña:", newPassword);

  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Side panel with SVG illustration */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-700 opacity-90"></div>

        {/* Pattern overlay */}
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

        {/* Educational illustration SVG */}
        <div className="relative z-10 p-8 max-w-lg">
          <svg
            viewBox="0 0 500 400"
            className="w-full h-auto"
            aria-hidden="true"
          >
            {/* Background */}
            <rect width="500" height="400" fill="none" />

            {/* Open book */}
            <g transform="translate(200, 160)">
              <path d="M-120,-40 L-120,40 L0,60 L120,40 L120,-40 L0,-20 Z" fill="#f0f4ff" />
              <path d="M0,-20 L0,60 L-120,40 L-120,-40 Z" fill="#e0e7ff" />
              <path d="M0,-20 L0,60 L120,40 L120,-40 Z" fill="#d1dafe" />
              <path d="M-90,0 L-40,10 M-90,20 L-40,30" stroke="#6875f5" strokeWidth="3" strokeLinecap="round" />
              <path d="M40,10 L90,0 M40,30 L90,20" stroke="#6875f5" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Bar chart (representing data analysis) */}
            <g transform="translate(100, 100)">
              <rect x="0" y="0" width="20" height="60" rx="2" fill="#818cf8" />
              <rect x="30" y="20" width="20" height="40" rx="2" fill="#818cf8" />
              <rect x="60" y="30" width="20" height="30" rx="2" fill="#818cf8" />
              <rect x="90" y="10" width="20" height="50" rx="2" fill="#818cf8" />
              <rect x="120" y="40" width="20" height="20" rx="2" fill="#818cf8" />
              <path d="M0,70 L150,70" stroke="#4f46e5" strokeWidth="2" />
              <path d="M0,0 L0,70" stroke="#4f46e5" strokeWidth="2" />
            </g>

            {/* Light bulb (idea) */}
            <g transform="translate(350, 90)">
              <circle cx="0" cy="0" r="25" fill="#fef3c7" />
              <path d="M0,30 L0,50" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <path d="M-10,50 L10,50" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <path d="M-15,20 L-30,30 M15,20 L30,30 M-15,-10 L-25,-20 M15,-10 L25,-20 M0,-25 L0,-40"
                stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Computer/Laptop */}
            <g transform="translate(330, 250)">
              <rect x="-60" y="-40" width="120" height="80" rx="5" fill="#1e3a8a" />
              <rect x="-50" y="-30" width="100" height="60" fill="#bfdbfe" />
              <rect x="-70" y="40" width="140" height="10" rx="2" fill="#1e3a8a" />
            </g>

            {/* Graduation cap */}
            <g transform="translate(100, 250)">
              <path d="M-30,-10 L30,-10 L40,0 L-40,0 Z" fill="#1e3a8a" />
              <rect x="-5" y="-30" width="10" height="20" fill="#1e3a8a" />
              <circle cx="0" cy="-35" r="10" fill="#1e3a8a" />
              <path d="M-40,0 L-40,10 L40,10 L40,0" stroke="#1e3a8a" strokeWidth="3" fill="none" />
              <path d="M-30,10 L-30,40 M30,10 L30,40" stroke="#1e3a8a" strokeWidth="2" />
              <path d="M-30,40 L30,40" stroke="#1e3a8a" strokeWidth="3" />
            </g>
          </svg>

          <div className="text-white mt-8">
            <h1 className="text-3xl font-bold mb-4">Sistema de Predicción de Deserción</h1>
            <p className="text-xl opacity-80">
              Herramienta analítica para identificar y reducir el abandono académico
            </p>
            <ul className="mt-6 space-y-2 list-disc list-inside opacity-80">
              <li>Análisis predictivo de factores de riesgo</li>
              <li>Seguimiento personalizado de estudiantes</li>
              <li>Intervención temprana y apoyo académico</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 md:w-1/2">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center animate-pulse">
              <svg className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 md:hidden">
            Sistema de Predicción de Deserción
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 md:hidden">
            Acceda a su cuenta para continuar
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

            {!isResettingPassword ? (
              // Login form
              token ? (
                // New password form (after clicking reset link)
                <form className="space-y-6" onSubmit={handleNewPasswordSubmit}>
                  <h3 className="text-lg font-medium text-gray-900">Establecer nueva contraseña</h3>
                  <p className="text-sm text-gray-600">
                    Por favor, ingrese su nueva contraseña.
                  </p>

                  <div className="space-y-2">
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                      Nueva contraseña
                    </label>
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                             transition-all duration-300 sm:text-sm
                             hover:border-indigo-300"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

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
                          Guardando...
                        </>
                      ) : 'Restablecer contraseña'}
                    </button>
                  </div>
                </form>
              ) : (
                // Standard login form
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
                      autoComplete="current-password"
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

                  <div className="flex items-center justify-between">
                    

                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={() => setIsResettingPassword(true)}
                        className="font-medium text-indigo-600 hover:text-indigo-500 
                                transition-colors duration-200
                                focus:outline-none focus:underline"
                      >
                        ¿Olvidó su contraseña?
                      </button>
                    </div>
                  </div>

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
                          Cargando...
                        </>
                      ) : 'Iniciar sesión'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              // Password reset request form
              <form className="space-y-6" onSubmit={handlePasswordReset}>
                <h3 className="text-lg font-medium text-gray-900">Recuperar contraseña</h3>
                <p className="text-sm text-gray-600">
                  Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
                </p>

                <div className="space-y-2">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                             transition-all duration-300 sm:text-sm
                             hover:border-indigo-300"
                    placeholder="usuario@universidad.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setIsResettingPassword(false)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300
                             rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white
                             transition-colors duration-200
                             hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Volver
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent
                             rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600
                             transition-all duration-300
                             hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 flex items-center justify-center">
              <div className="text-sm">
                <p className="text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="font-medium text-indigo-600 hover:text-indigo-500 
                              transition-colors duration-200
                              focus:outline-none focus:underline"
                  >
                    Regístrate
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

// Add global animation styles
const injectStyles = () => {
  const styleTag = document.createElement('style');
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

  // Only inject styles if they don't exist yet
  if (!document.querySelector('style[data-login-animations]')) {
    styleTag.setAttribute('data-login-animations', 'true');
    document.head.appendChild(styleTag);
  }
};

// Inject styles when component is used
if (typeof document !== 'undefined') {
  injectStyles();
}

export default LoginPage;