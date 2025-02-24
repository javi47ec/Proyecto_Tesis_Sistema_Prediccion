import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, currentUser, allowedRoles }) => {
  if (!allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
