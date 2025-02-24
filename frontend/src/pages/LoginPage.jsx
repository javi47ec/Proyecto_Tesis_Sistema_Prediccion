import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle } from '@mui/material';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
  
    try {
      const result = await onLogin(email, password);
  
      // Verificar si tenemos un token en la respuesta
      if (result?.token) {
        setSuccess('¡Inicio de sesión exitoso!');
        setTimeout(() => {
          setSuccess('');
          navigate('/');
        }, 2000);
      } else {
        throw new Error('Error al iniciar sesión. No se recibió el token.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al iniciar sesión. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema de Predicción de Deserción
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicie sesión para acceder al sistema
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <Alert
                severity="error"
                onClose={() => setError('')}
                sx={{ marginBottom: 2 }}
              >
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert
                severity="success"
                onClose={() => setSuccess('')}
                sx={{ marginBottom: 2 }}
              >
                <AlertTitle>¡Éxito!</AlertTitle>
                {success}
              </Alert>
            )}
          </div>

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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
