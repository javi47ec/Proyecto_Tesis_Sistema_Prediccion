const multer = require('multer');
const path = require('path');

// Configuración de Multer para subir archivos Excel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Guardará los archivos en la carpeta 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, `data_${Date.now()}${path.extname(file.originalname)}`);
  }
});
// Filtrar solo archivos Excel
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Por favor, sube un archivo Excel.'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Función para procesar el archivo Excel
const procesarArchivoExcel = (rutaArchivo) => {
  const workbook = xlsx.readFile(rutaArchivo); // Leer el archivo Excel
  const sheetName = workbook.SheetNames[0]; // Obtener la primera hoja
  const sheet = workbook.Sheets[sheetName];
  const datos = xlsx.utils.sheet_to_json(sheet); // Convertir la hoja a JSON

  return datos;
};


module.exports = {upload, procesarArchivoExcel};
