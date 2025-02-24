import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Alert, AlertTitle } from '@mui/material';
//import WarningIcon from '@material-ui/icons/Warning';
const Navbar = ({ onLogout, isAuthenticated, userRole, currentUser }) => {
  const [open, setOpen] = useState(false); // Estado para controlar el diálogo
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Lógica de cierre de sesión
    localStorage.removeItem('authToken');
    onLogout();
    navigate('/login'); // Redirige al login
    setOpen(false); // Cierra el diálogo
  };

  const handleDialogOpen = () => {
    setOpen(true); // Abre el diálogo
  };

  const handleDialogClose = () => {
    setOpen(false); // Cierra el diálogo sin cerrar sesión
  };

  const getActiveClass = (path) => (location.pathname === path ? 'active-link' : '');

  // Define las rutas según el rol del usuario
  const navigation = {
    BIENESTAR_ESTUDIANTIL: [
      { name: 'Inicio', path: '/home' },
      { name: 'Estudiantes y Predicciones', path: '/estudiantes' },
      { name: 'Riesgo de Deserción', path: '/predicciones' },
      { name: 'Reportes', path: '/reportes' },
      { name: 'Estadísticas', path: '/estadisticas' },
      { name: 'Seguimientos', path: '/seguimientos' }, // ✅ Nueva opción Seguimientos para estudiantes
      { name: 'Predicciones Futuras', path: '/predicciones-futuras' }, // ✅ Nueva opción
    ],
    DOCENTE: [
      { name: 'Estudiantes y Predicciones', path: '/estudiantes' },
    ],
    DIRECTOR: [
      { name: 'Panel de Director de Carrera', path: '/director' },
    ],
  };

  return (
    <nav className="navbar">
      <ul className="navbar-links">
        {isAuthenticated &&
          navigation[userRole]?.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className={getActiveClass(item.path)}>
                {item.name}
              </Link>
            </li>
          ))}
      </ul>
      {isAuthenticated && (
        <div className="navbar-right">
          <span>
            {userRole === 'DIRECTOR'
              ? currentUser?.nombre_usuario || 'Director'
              : userRole === 'BIENESTAR_ESTUDIANTIL'
              ? 'Bienestar Estudiantil'
              : 'Docente'}
          </span>    
          
             <button onClick={handleDialogOpen} className="logout-button">Cerrar sesión</button>
        </div>
      )}

      {/* Diálogo de confirmación */}
      <Dialog
        open={open}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Advertencia
        </DialogTitle>
        <DialogContent>
          {/* Mensaje de advertencia con ícono */}
          <Alert severity="warning" variant='filled' icon={<i className="fas fa-exclamation-triangle"></i>}>
            <AlertTitle>¡Atención!</AlertTitle>
            ¿Estás seguro de que deseas cerrar sesión? Perderás el acceso hasta que vuelvas a iniciar sesión.

          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleLogout} color="secondary" autoFocus>
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </nav>
  );
};

export default Navbar;
