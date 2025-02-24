import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserShield, FaSignOutAlt } from 'react-icons/fa'; // Agregar ícono para cierre de sesión

function AdminPage() {
  const navigate = useNavigate(); // Hook para redirigir a otra página

  // Función para cerrar sesión
  const handleLogout = () => {
    // Elimina la información de sesión del localStorage (o sessionStorage, dependiendo de tu implementación)
    localStorage.removeItem('authToken'); // El nombre puede variar según cómo guardes el token
    // Redirige al usuario a la página de inicio de sesión (o home)
    navigate('/login'); // O puedes usar '/login' si tienes una página específica para login
  };

  return (
    <div>
      {/* Barra superior con "Admin Sistema" y el ícono */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#f4f4f4',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      }}>
        <FaUserShield style={{ marginRight: '8px', fontSize: '20px' }} />
        <h3 style={{ margin: 0 }}>Admin Sistema</h3>

        {/* Botón para cerrar sesión */}
        <button 
          onClick={handleLogout} 
          style={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: '20px',
            backgroundColor: '#f44336',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
        >
          <FaSignOutAlt style={{ marginRight: '8px' }} />
          Cerrar sesión
        </button>
      </div>

      <h2>Bienvenido al área de Bienestar Estudiantil</h2>
      <nav>
        <ul>
          <li><Link to="/estudiantes">Gestión de Estudiantes</Link></li>
          <li><Link to="/predicciones">Predicciones de Riesgo</Link></li>
          <li><Link to="/reportes">Generar Reportes</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default AdminPage;
