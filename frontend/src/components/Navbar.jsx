import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Button, 
  Typography,
  Box
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

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

          <button 
            onClick={handleDialogOpen} 
            className="logout-button rounded-xl bg-red-600 px-5 py-3 text-base font-medium text-white 
                      shadow-md transition duration-200 ease-in-out transform hover:bg-red-700 
                      active:bg-red-800 hover:scale-105 active:scale-95 
                      dark:bg-red-500 dark:text-white dark:hover:bg-red-400 dark:active:bg-red-300">
            Cerrar sesión
          </button>
        </div>
      )}

      {/* Diálogo de confirmación mejorado */}
      <Dialog
        open={open}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: '400px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          id="alert-dialog-title"
          sx={{ 
            bgcolor: '#f44336', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 2
          }}
        >
          <WarningIcon sx={{ color: 'white' }} />
          <Typography variant="h6" fontWeight="bold">
            Cerrar Sesión
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3, px: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center', 
            my: 2 
          }}>
            <WarningIcon sx={{ fontSize: 48, color: '#f44336', mb: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              ¿Estás seguro de que deseas cerrar sesión?
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Perderás el acceso hasta que vuelvas a iniciar sesión.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
          <Button 
            onClick={handleDialogClose} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              borderColor: '#9e9e9e',
              color: '#666',
              '&:hover': {
                borderColor: '#757575',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="contained"
            color="error"
            autoFocus
            sx={{ 
              borderRadius: 2,
              px: 3,
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f'
              }
            }}
          >
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </nav>
  );
};

export default Navbar;