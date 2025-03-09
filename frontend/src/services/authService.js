import api from './api';

const USER_KEY = 'user';
const TOKEN_KEY = 'token';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      console.log("🔹 Respuesta del backend:", response.data);

      // Validar que tengamos todos los datos necesarios
      if (!response.data.token || !response.data.role) {
        throw new Error('Respuesta del servidor incompleta');
      }

      // Guardar token
      localStorage.setItem(TOKEN_KEY, response.data.token);

      // Guardar información del usuario
      const userData = {
        role: response.data.role,
        id_docente: response.data.id_docente || null,
        email: response.data.email || email // Guardar el email si está disponible
      };

      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      // Configurar el token para futuras peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      return response.data;
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      throw error.response?.data?.message || 'Error al iniciar sesión';
    }
  },
  // ✅ Función para solicitar el enlace de recuperación de contraseña
  forgotPassword: async (email) => {
    await api.post('/auth/forgot-password', { email });
  },

  // ✅ Función para cambiar la contraseña después de recibir el enlace
  resetPassword: async (token, nuevaContrasena) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { nuevaContrasena });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al restablecer la contraseña";
    }
  },

  register: async (email, password, role, id_docente) => {
    try {
      // Validar que los datos estén presentes
      if (!email || !password || !role) {
        throw new Error('Todos los campos son requeridos');
      }

      console.log('Datos a enviar:', { email, password, role, id_docente });
      const response = await api.post('/auth/register', {
        email,
        password,
        role,
        id_docente
      });
      console.log('Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      throw error.response?.data?.message || 'Error al registrarse';
    }
  },
  enviarCorreoRecuperacion: async (email) => {
    await api.post('/auth/forgot-password', { email });
  },

  restablecerContrasena: async (token, newPassword) => {
    await api.post(`/auth/reset-password/${token}`, { newPassword });
  },



  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;

      const user = JSON.parse(userStr);

      // Validar que el objeto usuario tenga la estructura esperada
      if (!user || !user.role) {
        console.warn('Datos de usuario inválidos en localStorage');
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      this.logout(); // Limpiar datos posiblemente corruptos
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    return !!(token && user);
  },

  // Método helper para verificar el rol
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  // Método helper para verificar si es Director
  isDirector: () => {
    return authService.hasRole('DIRECTOR');
  }
};

export default authService;