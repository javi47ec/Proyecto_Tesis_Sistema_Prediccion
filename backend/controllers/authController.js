const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

require('dotenv').config();

// 📌 Configurar el transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true, // Para SMTP seguro (generalmente puerto 465)
  tls: {
    rejectUnauthorized: false // Útil en entornos de desarrollo
  }
});

const authController = {
  register: async (req, res) => {
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
        process.env.JWT_SECRET,
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

  login: async (req, res) => {
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
        process.env.JWT_SECRET,
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
  },

  // 📍 1️⃣ Enviar enlace de recuperación de contraseña
  enviarCorreoRecuperacion: async (req, res) => {
    const { email } = req.body;

    try {
      // Verificar si el usuario existe
      const [user] = await pool.execute("SELECT * FROM usuario WHERE email = ?", [email]);
      if (user.length === 0) {
        return res.status(404).json({ message: "El correo no está registrado." });
      }

      // Generar token de recuperación (expira en 1 hora)
      const token = jwt.sign({ id: user[0].id_usuario }, process.env.JWT_SECRET, { expiresIn: "1h" });

      // Guardar el token en la base de datos con fecha de expiración
      await pool.execute(
        "UPDATE usuario SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id_usuario = ?",
        [token, user[0].id_usuario]
      );

      console.log(`🔹 Token generado y guardado en BD: ${token}`);

      // Enviar correo con enlace de recuperación
      const link = `http://localhost:3000/reset-password/${token}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Recuperación de contraseña",
        html: `<p>Hola,</p>
                   <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
                   <a href="${link}">${link}</a>
                   <p>Este enlace expirará en 1 hora.</p>
                   <p>Si no solicitaste este cambio, ignora este correo.</p>`,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Correo de recuperación enviado." });

    } catch (error) {
      console.error("Error al enviar el correo:", error);
      res.status(500).json({ message: "Error al enviar el correo de recuperación." });
    }
  },


  // 📍 2️⃣ Restablecer contraseña con el token
  restablecerContrasena: async (req, res) => {
    const { token } = req.params;
    const { nuevaContrasena } = req.body;

    try {
      // Buscar usuario con ese token y que no haya expirado
      const [users] = await pool.execute(
        "SELECT * FROM usuario WHERE reset_token = ? AND reset_token_expires > NOW()",
        [token]
      );

      if (users.length === 0) {
        return res.status(400).json({ message: "El enlace ha expirado o es inválido." });
      }

      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

      // Actualizar la contraseña y limpiar el token
      await pool.execute(
        "UPDATE usuario SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id_usuario = ?",
        [hashedPassword, users[0].id_usuario]
      );

      return res.json({ success: true, message: "Contraseña restablecida exitosamente." });

    } catch (error) {
      console.error("❌ Error al restablecer contraseña:", error);
      res.status(400).json({ message: "El enlace ha expirado o es inválido." });
    }

  }

};

module.exports = authController;