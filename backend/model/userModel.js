const pool = require('../config/db');
const bcrypt = require('bcrypt');

const userModel = {
  async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        `SELECT u.*, r.nombre as rol_nombre 
         FROM usuario u 
         JOIN rol r ON u.id_rol = r.id_rol 
         WHERE u.email = ?`,
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async updateLastAccess(userId) {
    try {
      await pool.execute(
        'UPDATE usuario SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = ?',
        [userId]
      );
    } catch (error) {
      throw error;
    }
  }
};

module.exports = userModel;