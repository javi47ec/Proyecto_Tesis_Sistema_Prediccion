import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ isAuthenticated, allowedRoles, userRole, children }) => {
  console.log("🔍 Estado de autenticación:", isAuthenticated);
  console.log("🔍 Rol del usuario:", userRole);
  console.log("🔍 Roles permitidos:", allowedRoles);

  if (!isAuthenticated) {
    console.warn("⛔ Usuario NO autenticado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.warn(`⛔ Acceso denegado: El rol '${userRole}' no está permitido en esta ruta.`);
    return <Navigate to="/" replace />;
  }

  console.log("✅ Usuario autenticado y con acceso permitido.");
  return children;
};

export default PrivateRoute;
