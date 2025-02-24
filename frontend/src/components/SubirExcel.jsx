import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const SubirExcel = ({ onUploadSuccess, onLoadingChange }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Función para procesar los datos del Excel
  const procesarDatosExcel = (datos) => {
    try {
      console.log("📂 Primeras filas del Excel:", datos.slice(0, 10));

      // Normalizar texto y limpiar caracteres especiales
      const normalizarTexto = (texto) => {
        if (!texto) return '';
        return texto.toString()
          .trim()
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      };

      // Convertir los datos a un array de arrays para mejor manejo
      const filasArray = datos.map(fila => Object.values(fila));

      // Buscar la fila que contiene "ID" y "NOMBRES"
      const indiceEncabezados = filasArray.findIndex(fila => {
        const filaTexto = fila.map(cel => normalizarTexto(cel)).join(' ');
        return filaTexto.includes('ID') && filaTexto.includes('NOMBRES');
      });

      if (indiceEncabezados === -1) {
        throw new Error("No se encontraron las columnas necesarias (ID, NOMBRES)");
      }

      // Obtener los encabezados reales
      const encabezadosReales = filasArray[indiceEncabezados].map(normalizarTexto);
      console.log("Encabezados reales encontrados:", encabezadosReales);

      // Obtener los índices de las columnas que necesitamos
      const indices = {
        nombres: encabezadosReales.findIndex(h => h === 'NOMBRES'),
        id: encabezadosReales.findIndex(h => h === 'ID'),
        cedula: encabezadosReales.findIndex(h => h.includes('CEDULA')),
        nota1: encabezadosReales.findIndex(h => h === '1P'),
        nota2: encabezadosReales.findIndex(h => h === '2P'),
        nota3: encabezadosReales.findIndex(h => h === '3P'),
        nivelReferencial: encabezadosReales.findIndex(h => h.includes('NIVEL REFERENCIAL'))
      };

      // Validar que todas las columnas necesarias estén presentes
      if (indices.nombres === -1 || indices.id === -1 || indices.nota1 === -1 || indices.nota2 === -1 || indices.nota3 === -1 || indices.nivelReferencial === -1) {
        throw new Error("El archivo no contiene todas las columnas necesarias (ID, NOMBRES, 1P, 2P, 3P, NIVEL REFERENCIAL)");
      }

      // Procesar solo las filas que contienen datos (después de los encabezados)
      const datosProcesados = filasArray.slice(indiceEncabezados + 1)
        .filter(fila => {
          const idValor = fila[indices.id]?.toString().trim();
          return idValor && idValor !== "ID";
        })
        .map((fila, index) => {
          return {
            ID: fila[indices.id]?.toString().trim() || `Desconocido_${index}`,
            Nombres: fila[indices.nombres]?.toString().trim() || "Desconocido",
            Cedula: indices.cedula >= 0 ? fila[indices.cedula]?.toString().trim() || "N/A" : "N/A",
            Nota_1: indices.nota1 >= 0 ? parseFloat(fila[indices.nota1]) || null : null,
            Nota_2: indices.nota2 >= 0 ? parseFloat(fila[indices.nota2]) || null : null,
            Nota_3: indices.nota3 >= 0 ? parseFloat(fila[indices.nota3]) || null : null,
            Nivel_Referencial: indices.nivelReferencial >= 0 ? fila[indices.nivelReferencial]?.toString().trim() || "Desconocido" : "Desconocido"
          };
        });

      console.log("✅ Datos procesados correctamente:", datosProcesados);
      return datosProcesados;
    } catch (error) {
      console.error("❌ Error procesando datos:", error);
      throw error;
    }
  };

  // Maneja la selección del archivo
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    setPreviewData(null); // Reinicia la vista previa al seleccionar un nuevo archivo
  };

  // Función para previsualizar la data sin enviarla
  const handlePrevisualizar = async () => {
    if (!selectedFile) {
      setError("Por favor, seleccione un archivo primero");
      return;
    }
    try {
      onLoadingChange?.(true);
      setError(null);
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
        blankrows: false
      });

      console.log("📊 Datos leídos del Excel:", jsonData);

      if (!jsonData || jsonData.length === 0) {
        throw new Error("El archivo está vacío o no contiene datos válidos");
      }

      const datosProcesados = procesarDatosExcel(jsonData);
      console.log("✅ Datos procesados:", datosProcesados);
      setPreviewData(datosProcesados);
    } catch (error) {
      console.error("❌ Error previsualizando datos:", error);
      setError(`Error: ${error.message}`);
    } finally {
      onLoadingChange?.(false);
    }
  };

  // Función para enviar el archivo y los datos al backend
  const handleEnviar = async () => {
    if (!selectedFile || !previewData) {
      setError("Por favor, asegúrese de haber previsualizado la data primero.");
      return;
    }
    try {
      onLoadingChange?.(true);
      setError(null);
      const resultado = await enviarAlBackend(selectedFile, previewData);
      console.log("✅ Respuesta del servidor:", resultado);
      onUploadSuccess?.(resultado);
    } catch (error) {
      console.error("❌ Error enviando data:", error);
      setError(`Error: ${error.message}`);
    } finally {
      onLoadingChange?.(false);
    }
  };

  // Función para enviar la data al backend
  const enviarAlBackend = async (file, datos) => {
    try {
      const formData = new FormData();
      formData.append("archivo", file);
      formData.append("datos", JSON.stringify(datos));

      console.log("📡 Enviando al backend:", datos);

      const response = await axios.post(
        "http://localhost:5000/api/estudiantes/predecir-datos-futuros",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data) {
        throw new Error("No se recibió respuesta del servidor");
      }

      return response.data;
    } catch (error) {
      console.error("Error en la petición:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = previewData ? previewData.slice(indexOfFirstRow, indexOfLastRow) : [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = previewData ? Math.ceil(previewData.length / rowsPerPage) : 1;

  const visiblePages = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    let pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Subir Datos para Periodo Académico</h2>
      <div className="space-y-4">
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrevisualizar}
            disabled={!selectedFile}
            className={`w-1/2 py-2 px-4 rounded-md font-medium ${selectedFile
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Previsualizar Datos
          </button>
          <button
            onClick={handleEnviar}
            disabled={!selectedFile || !previewData}
            className={`w-1/2 py-2 px-4 rounded-md font-medium ${selectedFile && previewData
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Enviar y Predecir
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Vista previa de la data */}
      {previewData && previewData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-bold mb-2">Vista previa de datos:</h3>
          <table className="min-w-full table-auto border">
            <thead>
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Nombres</th>
                <th className="border px-2 py-1">Cédula</th>
                <th className="border px-2 py-1">Nota 1</th>
                <th className="border px-2 py-1">Nota 2</th>
                <th className="border px-2 py-1">Nota 3</th>
                <th className="border px-2 py-1">Nivel Referencial</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border px-2 py-1">{row.ID}</td>
                  <td className="border px-2 py-1">{row.Nombres}</td>
                  <td className="border px-2 py-1">{row.Cedula}</td>
                  <td className="border px-2 py-1">{row.Nota_1}</td>
                  <td className="border px-2 py-1">{row.Nota_2}</td>
                  <td className="border px-2 py-1">{row.Nota_3}</td>
                  <td className="border px-2 py-1">{row.Nivel_Referencial}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 mr-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
            >
              Anterior
            </button>

            {visiblePages().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                className={`px-3 py-2 mx-1 rounded ${currentPage === pageNumber ? 'bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 ml-2 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubirExcel;