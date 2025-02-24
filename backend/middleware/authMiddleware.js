const jwt = require('jsonwebtoken');

const authMiddleware = {
  verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  },

  checkRole(roles) {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'No tienes permiso para acceder a este recurso' 
        });
      }
      next();
    };
  }
};

module.exports = authMiddleware;
