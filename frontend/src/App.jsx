import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EstudiantesPage from './pages/EstudiantesPage';
import PrediccionesPage from './pages/PrediccionesPage';
import ReportesPage from './pages/ReportesPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import HistorialAcademicoPage from './pages/HistorialPage';
import EstadisticasPage from './pages/EstadisticasPage';
import authService from './services/authService';
import RegisterPage from './pages/RegisterPage';
import EstudianteDetail from './components/Estudiantes/EstudianteDetail';
import PrediccionesFuturasPage from './pages/PrediccionesFuturasPage';
import SeguimientosPage from './pages/SeguimientosPage';
import SuperUserDashboard from './pages/SuperUserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Snackbar, Alert } from '@mui/material';
import ResetPasswordPage from './pages/ResetPasswordPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser() || {});
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación al cargar la aplicación
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      setCurrentUser(authService.getCurrentUser() || {});
    };

    checkAuth();
  }, []);

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      setIsAuthenticated(true);
      setCurrentUser({
        role: response.role,
        nombre_usuario: response.nombre_usuario,
        //isFirstAccess: response.isFirstAccess
      });

      // Redirigir según el rol
      const roleRoutes = {
        BIENESTAR_ESTUDIANTIL: '/home',
        DOCENTE: '/estudiantes',
        DIRECTOR: '/director'
      };

      navigate(roleRoutes[response.role] || '/login'); // Si no tiene un rol válido lo redirige al login
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      // Reemplazamos el alert por la notificación estética
      setErrorMessage('Usuario o contraseña incorrectos. Intente de nuevo');
      setErrorOpen(true);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
  };

  const getMenuOptions = () => {
    if (currentUser?.role === 'BIENESTAR_ESTUDIANTIL') {
      return [
        { name: 'Inicio', path: '/home' },
        { name: 'Estudiantes', path: '/estudiantes' },
        { name: 'Predicciones', path: '/predicciones' },
        { name: 'Predicciones Futuras', path: '/predicciones-futuras' }, // ✅ Nueva opción
        { name: 'Reportes', path: '/reportes' },
        { name: 'Estadísticas', path: '/estadisticas' },
        { name: 'Seguimientos', path: '/seguimientos' },

      ];
    } else if (currentUser?.role === 'DOCENTE') {
      return [
        { name: 'Estudiantes', path: '/estudiantes' },
      ];
    } else if (currentUser?.role === 'DIRECTOR') {
      return [
        { name: 'Panel de Director de Carrera', path: '/director' },
      ];
    }
    return [];
  };

  return (
    <div>
      {/* Notificación de error */}
      <Snackbar 
        open={errorOpen} 
        autoHideDuration={10000} 
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleErrorClose} 
          severity="error" 
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiAlert-icon': {
              fontSize: '1.25rem'
            },
            '& .MuiAlert-message': {
              fontSize: '0.95rem',
              fontWeight: 500
            }
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Routes>
        {/* Rutas públicas sin Navbar */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage onLogin={handleLogin} /> : <Navigate to={currentUser?.role === 'BIENESTAR_ESTUDIANTIL' ? '/home' : '/estudiantes'} replace />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        {/* Rutas con Navbar (Aplicación autenticada) */}
        <Route path="/*" element={
          isAuthenticated ? (
            <>
              <Navbar
                onLogout={handleLogout}
                isAuthenticated={isAuthenticated}
                userRole={currentUser?.role}
                menuOptions={getMenuOptions()}
                currentUser={currentUser}
              />
              <Routes>
                {/* Ruta principal - redirige según rol */}
                <Route
                  path="/"
                  element={
                    <Navigate
                      to={
                        currentUser?.role === 'BIENESTUDIANTIL'
                          ? '/home'
                          : currentUser?.role === 'DIRECTOR'
                            ? '/director'
                            : currentUser?.role === 'DOCENTE'
                              ? '/estudiantes'
                              : '/login'
                      }
                      replace
                    />
                  }
                />

                {/* Rutas protegidas para Bienestar Estudiantil */}
                <Route
                  path="/home"
                  element={
                    <PrivateRoute
                      isAuthenticated={isAuthenticated}
                      allowedRoles={['BIENESTAR_ESTUDIANTIL']}
                      userRole={currentUser?.role}
                    >
                      <Home />
                    </PrivateRoute>
                  }
                />

                {/* Rutas de estudiantes */}
                <Route
                  path="/estudiantes"
                  element={
                    <PrivateRoute
                      isAuthenticated={isAuthenticated}
                      allowedRoles={['BIENESTAR_ESTUDIANTIL', 'DOCENTE']}
                      userRole={currentUser?.role}
                    >
                      <EstudiantesPage currentUser={currentUser} />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/estudiantes/:id"
                  element={
                    <PrivateRoute
                      isAuthenticated={isAuthenticated}
                      allowedRoles={['BIENESTAR_ESTUDIANTIL', 'DOCENTE']}
                      userRole={currentUser?.role}
                    >
                      <EstudianteDetail />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/predicciones"
                  element={
                    <PrivateRoute
                      isAuthenticated={isAuthenticated}
                      allowedRoles={['BIENESTAR_ESTUDIANTIL']}
                      userRole={currentUser?.role}
                    >
                      <PrediccionesPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/reportes"
                  element={
                    <PrivateRoute
                      isAuthenticated={isAuthenticated}
                      allowedRoles={['BIENESTAR_ESTUDIANTIL']}
                      userRole={currentUser?.role}
                    >
                      <ReportesPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/estadisticas"
                  element={
                    <PrivateRoute
                      isAuthenticated={isAuthenticated}
                      allowedRoles={['BIENESTAR_ESTUDIANTIL']}
                      userRole={currentUser?.role}
                    >
                      <EstadisticasPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/historialAcademico/:id"
                  element={
                    <PrivateRoute
                      isAuthenticated={isAuthenticated}
                      allowedRoles={['BIENESTAR_ESTUDIANTIL', 'DOCENTE']}
                      userRole={currentUser?.role}
                    >
                      <HistorialAcademicoPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/predicciones-futuras"
                  element={
                    <PrivateRoute
                      isAuthenticated={isAuthenticated}
                      allowedRoles={['BIENESTAR_ESTUDIANTIL']}  // ✅ Solo Bienestar Estudiantil
                      userRole={currentUser?.role}
                    >
                      <PrediccionesFuturasPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/seguimientos"
                  element={
                    <PrivateRoute
                      isAuthenticated={isAuthenticated}
                      allowedRoles={['BIENESTAR_ESTUDIANTIL']}  // ✅ Solo Bienestar Estudiantil
                      userRole={currentUser?.role}
                    >
                      <SeguimientosPage currentUser={currentUser} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/director"
                  element={
                    <ProtectedRoute currentUser={currentUser} allowedRoles={['DIRECTOR']}>
                      <SuperUserDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </div>
  );
};

export default App;