require('dotenv').config();
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const estudiantesRoutes = require('./routes/estudiantesRoutes');
const { exec } = require('child_process');
const predictionRoutes = require('./routes/predictionRoute');
//IMPORTACION RUTA ESTADISTICA
const estadisticasRoutes = require('./routes/estadisticasRoutes');

// IMPORTACION DE SEGUIMIENTO POR PARTE DE DOCENTE
const seguimientoRoutes = require('./routes/seguimientoRoutes');

const authRoutes = require('./routes/authRoutes');
// Rutas de período
const periodoRoutes = require('./routes/periodoRoutes');

const port = process.env.PORT || 5000;
const routes = require('./routes');
// Configuración de la conexión a MySQL
const pool = require('./config/db');

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/api/estudiantes', estudiantesRoutes); // prefijo de la ruta
app.use('/api/estudiantes', predictionRoutes);

app.use('/api/estadisticas', estadisticasRoutes); // prefijo de la ruta estadisticas
app.use('/api/seguimientos', seguimientoRoutes); // Prefijo para seguimientos
app.use('/api/auth', authRoutes); // prefijo para autenticacion
app.use('/api/periodos', periodoRoutes); // prefijo de la ruta
app.use('/api', estadisticasRoutes); // Debe coincidir con la ruta en el frontend

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Petición recibida:', req.body);
    const { email, password, role } = req.body;
    const connection = await pool.getConnection();
    // Log para verificar los datos
    console.log('Datos recibidos:', { email, password, role });

    // Verificar si el usuario ya existe
    const [existingUsers] = await connection.execute(
      'SELECT * FROM usuario WHERE email = ?',
      [email]
    );
    console.log('Usuarios existentes:', existingUsers);

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Obtener el id_rol basado en el nombre del rol
    const [roles] = await connection.execute(
      'SELECT id_rol FROM rol WHERE nombre = ?',
      [role || 'DOCENTE']
    );
    if (roles.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Rol no válido' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    const [result] = await connection.execute(
      'INSERT INTO usuario (email, password, id_rol) VALUES (?, ?, ?)',
      [email, hashedPassword, roles[0].id_rol]
    );

    // Generar token
    const token = jwt.sign(
      { email, role: role || 'DOCENTE' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    connection.release();

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      role: role || 'DOCENTE'
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({
      message: 'Error en el servidor',
      error: process.env.NODE_ENV == 'development' ? error.message : undefined
    });
  }
});

app.post('/api/estudiantes/predict', (req, res) => {
  console.log('Datos recibidos:', req.body); // Log para depuración

  // Validar que req.body.data existe y es un array
  if (!req.body.data || !Array.isArray(req.body.data)) {
    return res.status(400).json({ 
      error: 'Se requiere un array de datos en el campo "data"' 
    });
  }

  // Construir ruta absoluta al script de Python
  const scriptPath = path.join(__dirname, './model/cargarModelo.py');

  // Preparar datos para enviar a Python
  const inputData = JSON.stringify({ data: req.body.data });

  console.log('Ejecutando script de Python con datos:', inputData); // Log para depuración

  // Ejecutar script de Python
  exec(`python "${scriptPath}" '${inputData}'`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error ejecutando el modelo:', error);
      console.error('stderr:', stderr);
      return res.status(500).json({ error: 'Error en la predicción' });
    }
    
    try {
      console.log('Salida de Python:', stdout.trim()); // Log para depuración
      const result = JSON.parse(stdout.trim());
      res.json(result);
    } catch (e) {
      console.error('Error parseando resultado:', e);
      console.error('Respuesta de Python:', stdout);
      res.status(500).json({ error: 'Error procesando resultado' });
    }
  });
});



// Resto de las rutas
app.use('/api', routes);

// Configuración de multer y rutas de archivos Excel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Rutas de archivos
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar el archivo');
  }
});

// Obtener historial académico, promedios y desviación estándar
app.get('/api/estudiantes/:id/historial', async (req, res) => {
  const { id } = req.params;

  try {
    const [historial] = await pool.execute(`
      SELECT 
          a.nombre AS nombre_asignatura, 
          ha.periodo, 
          ha.nota_1p, 
          ha.nota_2p, 
          ha.nota_3p, 
          ha.promedio, 
          ha.estado 
      FROM 
          historial_academico ha
      INNER JOIN 
          asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
      WHERE 
          ha.id_estudiante = ?
      ORDER BY 
          ha.periodo ASC;
    `, [id]);

    if (!historial.length) {
      return res.status(404).json({ message: 'Historial académico no encontrado' });
    }

    // Validar y calcular promedios si las notas están completas
    const promedios = historial.map(registro => {
      const { nota_1p, nota_2p, nota_3p } = registro;
      const notas = [nota_1p, nota_2p, nota_3p].filter(nota => nota !== null);
      const promedio = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;
      return { ...registro, promedio };
    });

    const promedioGeneral = promedios.reduce((acc, registro) => acc + registro.promedio, 0) / promedios.length || 0;

    const desviacionEstandar = promedios.length
      ? Math.sqrt(
        promedios.reduce((acc, registro) => acc + Math.pow(registro.promedio - promedioGeneral, 2), 0) / promedios.length
      )
      : 0;

    res.json({
      historial: promedios,
      promedioGeneral: promedioGeneral.toFixed(2),
      desviacionEstandar: desviacionEstandar.toFixed(2),
    });
  } catch (error) {
    console.error('Error al obtener historial académico:', error);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/estudiantes/:id', async (req, res) => {
  const obtenerEstudiantePorId = async (id) => {
    const [result] = await pool.execute('SELECT * FROM estudiante WHERE id_estudiante = ?', [id]);
    return result.length ? result[0] : null;
  };
  const { id } = req.params;
  try {
    const estudiante = await obtenerEstudiantePorId(id); // Lógica para buscar al estudiante
    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    res.status(200).json(estudiante);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los datos del estudiante' });
  }
});

app.get('/api/estudiantes/basico', async (req, res) => {
  try {
    console.log('Iniciando consulta de estudiantes...');
    const query = 'SELECT id_estudiante, nombres, apellidos FROM estudiante';
    const [result] = await pool.execute(query);
    console.log('Resultado de la consulta:', result);

    if (!result || result.length === 0) {
      console.log('No se encontraron estudiantes');
      return res.status(404).json({ message: 'No se encontraron estudiantes' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener estudiantes básicos:', error);
    res.status(500).json({ error: 'Error al obtener estudiantes básicos', details: error.message });
  }
});

app.get('/api/periodos', async (req, res) => {
  try {
    console.log('Iniciando consulta de periodos...');
    const query = 'SELECT * FROM historial_academico WHERE periodo = "202450"';
    const [result] = await pool.execute(query);
    console.log('Resultado de la consulta:', result);

    if (!result || result.length === 0) {
      console.log('No se encontraron periodos');
      return res.status(404).json({ message: 'No se encontraron periodos' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener periodos:', error);
    res.status(500).json({ error: 'Error al obtener periodos' });
  }
});

app.get('/api/niveles', async (req, res) => {
  try {
    console.log('Iniciando consulta de niveles...');
    const query = 'SELECT DISTINCT nombre FROM nivel';
    const [result] = await pool.execute(query);
    console.log('Resultado de la consulta:', result);

    if (!result || result.length === 0) {
      console.log('No se encontraron niveles');
      return res.status(404).json({ message: 'No se encontraron niveles' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener niveles:', error);
    res.status(500).json({ error: 'Error al obtener niveles' });
  }
});

app.get('/api/estudiantes-por-nivel', async (req, res) => {
  try {
    const query = `
      SELECT 
        n.nombre AS nivel,
        COUNT(e.id_estudiante) AS cantidad
      FROM 
        nivel n
      LEFT JOIN 
        historial_academico ha ON ha.nivel_id = n.nivel_id
      LEFT JOIN 
        estudiante e ON e.id_estudiante = ha.id_estudiante
      GROUP BY 
        n.nombre
    `;
    const [result] = await pool.execute(query);
    console.log('Resultado de la consulta:', result);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener estudiantes por nivel:', error);
    res.status(500).json({ error: 'Error al obtener estudiantes por nivel' });
  }
});
//Filtrar estudiantes por periodo y nivel
app.get('/api/estudiantes/filtrar', async (req, res) => {
  const { nivel, periodo } = req.query;

  try {
    const [result] = await pool.execute(
      'SELECT * FROM estudiante WHERE nivel = ? AND periodo = ?',
      [nivel, periodo]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron estudiantes para el nivel y período seleccionados.',
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener los estudiantes:', error);
    res.status(500).json({ message: 'Error al obtener los estudiantes.' });
  }
});

app.post('/api/estudiantes/acciones/guardar', (req, res) => {
  console.log('Datos recibidos;', req.body);
  const { id_estudiante, descripcion, recomendacion, seguimiento } = req.body;

  if (!id_estudiante || !descripcion || !recomendacion || !seguimiento) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const query = 'INSERT INTO acciones_estudiante (id_estudiante, descripcion, recomendacion, seguimiento) VALUES (?, ?, ?, ?)';
  pool.query(query, [id_estudiante, descripcion, recomendacion, seguimiento], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error al guardar acciones' });
    }
    res.status(200).json({ message: 'Acciones guardadas exitosamente' });
  });
});

app.get('/api/estudiantes/historial/:id', async (req, res) => {
  const { id } = req.params;
  console.log('ID recibido:', id); // Agregar log para depuración
  try {
    const [result] = await pool.execute(`
      SELECT 
          ha.periodo, 
          a.nombre AS nombre_asignatura, 
          ha.nota_1p, 
          ha.nota_2p, 
          ha.nota_3p, 
          ha.promedio, 
          ha.estado 
      FROM 
          historial_academico ha
      JOIN 
          asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
      WHERE 
          ha.id_estudiante = ?`,
      [id]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'No se encontró historial académico para el estudiante' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener historial académico:', error.message);
    console.error('Stack:', error.stack); // Agrega esta línea
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/historial', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', 'datos_limpios.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al leer el archivo Excel');
  }
});

app.get('/', (req, res) => {
  res.send('Bienvenido al servidor del historial académico');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
