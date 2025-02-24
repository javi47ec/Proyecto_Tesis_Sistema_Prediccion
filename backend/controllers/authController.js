const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authController = {
  register : async (req, res) => {
    const { email, password, role, id_docente } = req.body;
  
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Faltan datos necesarios' });
    }
  
    try {
      // 🔹 Verificar si el usuario ya existe
      const [existingUsers] = await pool.execute('SELECT * FROM usuario WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'El usuario ya está registrado' });
      }
  
      // 🔹 Obtener el id_rol
      const [roles] = await pool.execute('SELECT id_rol FROM rol WHERE nombre = ?', [role]);
      if (roles.length === 0) {
        return res.status(400).json({ message: 'Rol no válido' });
      }
      const id_rol = roles[0].id_rol;
  
      // 🔹 Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // 🔹 Insertar usuario en `usuario`
      const queryUsuario = `INSERT INTO usuario (password, email, id_rol) VALUES (?, ?, ?)`;
      const [resultUsuario] = await pool.execute(queryUsuario, [hashedPassword, email, id_rol]);
  
      let idDocenteAsociado = null;
      if (role === 'DOCENTE') {
        if (!id_docente) {
          return res.status(400).json({ message: 'Debe seleccionar un docente' });
        }
  
        // 🔹 Verificar si el `id_docente` existe en `docente`
        const [docente] = await pool.execute('SELECT id_docente FROM docente WHERE id_docente = ?', [id_docente]);
        if (docente.length === 0) {
          return res.status(400).json({ message: 'Docente no encontrado' });
        }
  
        // 🔹 Asociar usuario con docente en `docente_usuario`
        await pool.execute('INSERT INTO docente_usuario (id_docente, id_usuario) VALUES (?, ?)', [
          id_docente,
          resultUsuario.insertId,
        ]);
  
        idDocenteAsociado = id_docente;
      }
  
      // 🔹 Generar token con `id_docente`
      const token = jwt.sign(
        { email, role, id_docente: idDocenteAsociado },
        'your_secret_key',
        { expiresIn: '1h' }
      );
  
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        role,
        id_docente: idDocenteAsociado
      });
    } catch (error) {
      console.error('❌ Error al registrar usuario:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  },

  login : async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // 🔹 Buscar usuario en la base de datos
      const [rows] = await pool.execute(`
        SELECT u.*, r.nombre as role_nombre
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.email = ?
      `, [email]);
  
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
  
      const usuario = rows[0];
  
      // 🔹 Verificar contraseña
      const isMatch = await bcrypt.compare(password, usuario.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
  
      let id_docente = null;
      if (usuario.role_nombre === 'DOCENTE') {
        console.log("🔍 Buscando ID del docente...");
        
        const [docente] = await pool.execute(`
          SELECT d.id_docente
          FROM docente d
          JOIN docente_usuario du ON d.id_docente = du.id_docente
          WHERE du.id_usuario = ?
        `, [usuario.id_usuario]);
  
        console.log("🔹 Docente encontrado en BD:", docente); // ✅ Verificar si existe
  
        if (docente.length > 0) {
          id_docente = docente[0].id_docente;
        }
      }
  
      console.log("✅ ID Docente asignado en login:", id_docente); // 📌 Verificar si se obtiene
  
      // 🔹 Generar token con `id_docente`
      const token = jwt.sign(
        { email: usuario.email, role: usuario.role_nombre, id_docente },
        'your_secret_key',
        { expiresIn: '1h' }
      );
  
      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        role: usuario.role_nombre,
        id_docente
      });
  
    } catch (error) {
      console.error('❌ Error en el inicio de sesión:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  obtenerDocentes: async (req, res) => {
    try {
      const [docentes] = await pool.execute('SELECT id_docente, nombres, apellidos FROM docente');
      res.json(docentes);
    } catch (error) {
      console.error('❌ Error al obtener docentes:', error);
      res.status(500).json({ message: 'Error al obtener docentes' });
    }
  }
};

module.exports = authController;
