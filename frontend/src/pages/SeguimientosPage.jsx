import React, { useState, useEffect } from "react";
import { obtenerSeguimientos, actualizarSeguimiento } from "../services/estudiantesService";
import * as XLSX from "xlsx";

const SeguimientosPage = ({ currentUser }) => {
  const [seguimientos, setSeguimientos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 10;

  // Filtros
  const [filtroEstudiante, setFiltroEstudiante] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  useEffect(() => {
    cargarSeguimientos();
  }, []);

  // 🔄 Cargar datos de seguimiento desde el backend
  const cargarSeguimientos = async () => {
    try {
      const data = await obtenerSeguimientos();
      setSeguimientos(data);
    } catch (error) {
      console.error("Error al obtener seguimientos:", error);
    }
  };

  // ✅ Función para aprobar o rechazar seguimiento
  const actualizarEstadoSeguimiento = async (id, nuevoEstado) => {
    try {
      await actualizarSeguimiento(id, nuevoEstado);
      alert(`Seguimiento ${nuevoEstado.toLowerCase()} correctamente.`);
      cargarSeguimientos();
    } catch (error) {
      console.error("Error al actualizar estado del seguimiento:", error);
      alert("Hubo un error al actualizar el seguimiento.");
    }
  };

  // 📌 Filtros
  const seguimientosFiltrados = seguimientos.filter((seg) => {
    return (
      seg.nombres_estudiante.toLowerCase().includes(filtroEstudiante.toLowerCase()) &&
      (filtroFecha === "" || new Date(seg.fecha_creacion).toISOString().slice(0, 10) === filtroFecha)
    );
  });

  // 📌 Paginación
  const indiceInicial = (paginaActual - 1) * filasPorPagina;
  const indiceFinal = indiceInicial + filasPorPagina;
  const seguimientosPaginados = seguimientosFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(seguimientosFiltrados.length / filasPorPagina);
  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  // 📥 Exportar a Excel
  const exportarExcel = () => {
    const hojaDatos = seguimientosFiltrados.map((seg) => ({
      Estudiante: `${seg.nombres_estudiante} ${seg.apellidos_estudiante}`,
      Docente: `${seg.nombre_docente} ${seg.apellido_docente}`,
      Comentario: seg.comentario,
      Fecha: new Date(seg.fecha_creacion).toLocaleDateString(),
      Estado: seg.estado,
    }));

    const ws = XLSX.utils.json_to_sheet(hojaDatos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Seguimientos");
    XLSX.writeFile(wb, "Seguimientos.xlsx");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📌 Seguimientos de Estudiantes</h1>

      {/* 📌 Barra de filtros */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por estudiante..."
          className="p-2 border rounded w-1/3"
          value={filtroEstudiante}
          onChange={(e) => setFiltroEstudiante(e.target.value)}
        />
        <input
          type="date"
          className="p-2 border rounded"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
        <button onClick={exportarExcel} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">
          📥 Exportar a Excel
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="px-6 py-3 border-b text-left">Estudiante</th>
            <th className="px-6 py-3 border-b text-left">Docente</th>
            <th className="px-6 py-3 border-b text-left">Comentario</th>
            <th className="px-6 py-3 border-b text-left">Fecha</th>
            <th className="px-6 py-3 border-b text-left">Estado</th>
            <th className="px-6 py-3 border-b text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {seguimientosPaginados.map((seg, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="border px-4 py-2">{seg.id_estudiante}</td>
              <td className="px-6 py-4 border-b">{seg.nombres_estudiante} {seg.apellidos_estudiante}</td>
              <td className="px-6 py-4 border-b">{seg.nombre_docente} {seg.apellido_docente}</td>
              <td className="px-6 py-4 border-b">{seg.comentario}</td>
              <td className="px-6 py-4 border-b">{new Date(seg.fecha_creacion).toLocaleDateString()}</td>

              {/* 📌 Estado con colores dinámicos */}
              <td className="px-6 py-4 border-b">
                <span className={`px-2 py-1 rounded ${seg.estado === "APROBADO" ? "bg-green-200 text-green-800" : seg.estado === "RECHAZADO" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"}`}>
                  {seg.estado}
                </span>
              </td>

              {/* 🔘 Acciones para aprobar o rechazar (Solo Bienestar Estudiantil) */}
              <td className="px-6 py-4 border-b">
                {seg.estado === "PENDIENTE" && currentUser.role === "BIENESTAR_ESTUDIANTIL" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => actualizarEstadoSeguimiento(seg.id_seguimiento, "APROBADO")}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      onClick={() => actualizarEstadoSeguimiento(seg.id_seguimiento, "RECHAZADO")}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">Sin acciones</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          className={`px-4 py-2 rounded ${paginaActual === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
          onClick={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          ⬅ Anterior
        </button>

        <p className="text-sm font-medium">
          Página {paginaActual} de {totalPaginas}
        </p>

        <button
          className={`px-4 py-2 rounded ${paginaActual === totalPaginas ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
          onClick={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente ➡
        </button>
      </div>
    </div>
  );
};

export default SeguimientosPage;
