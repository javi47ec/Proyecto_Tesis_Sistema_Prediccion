import React, { useState, useEffect, useContext, useMemo } from 'react';
import { obtenerPeriodos, obtenerNiveles, obtenerEstudiantesFiltrados, obtenerHistorialAcademico, realizarPrediccionesMultiples } from '../services/estudiantesService';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { guardarSeguimiento } from '../services/estudiantesService';
import axios from 'axios';
import { GlobalStateContext } from '../context/GlobalStateContext';
import { obtenerPredicciones } from '../services/prediccionesService';
import { Search, ListFilter } from 'lucide-react';
const EstudiantesPage = ({ currentUser }) => {
  const { id } = useParams();
  const [showNoResultsModal, setShowNoResultsModal] = useState(false);
  const [, setPeriodos] = useState([]);
  const [progreso, setProgreso] = useState(0);
  const [, setNiveles] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [estudiantesConRiesgo, setEstudiantesConRiesgo] = useState([]);
  const [historialModal, setHistorialModal] = useState(null);
  const navigate = useNavigate();
  const studentsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [predicciones, setPredicciones] = useState({});
  const [, setPeriodoActivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { periodoActivo } = useContext(GlobalStateContext);


  // MODAL DE SEGUIMIENTO PARA ESTUDIANTES
  const [comentario, setComentario] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false); // Estado para abrir y cerrar el modal

  // 🔥 Recuperar predicciones cuando se monta el componente
  useEffect(() => {
    // 📌 Recuperar predicciones al cargar la página
    const storedPredicciones = localStorage.getItem("prediccionesData");
    if (storedPredicciones) {
      setPredicciones(JSON.parse(storedPredicciones));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(predicciones).length > 0) {
      localStorage.setItem("prediccionesData", JSON.stringify(predicciones));
    }
  }, [predicciones]);
  // Solo se ejecuta al montar el componente

  // Abre el modal de confirmacion
  const handleAbrirSeguimiento = (estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setModalAbierto(true); // ✅ Abre el modal
  };

  // Cierra el modal sin registrar


  const handleCerrarSeguimiento = () => {
    setModalAbierto(false);
    setComentario("");
    setEstudianteSeleccionado(null);
  };


  const handleGuardarSeguimiento = async () => {
    if (!comentario.trim()) {
      alert("Por favor, escribe un comentario.");
      return;
    }
    console.log("👤 Usuario actual en EstudiantesPage:", currentUser); // 📌 Verifica que tenga id_docente
    try {
      // 🔹 Asegurar que `id_docente` venga del usuario autenticado
      const idDocente = currentUser?.id_docente;

      if (!idDocente) {
        alert("Error: No se encontró el ID del docente.");
        return;
      }

      await guardarSeguimiento({
        id_estudiante: estudianteSeleccionado.id_estudiante,
        id_docente: idDocente,
        comentario,
      });

      alert("✅ Seguimiento registrado correctamente.");
      handleCerrarSeguimiento();
    } catch (error) {
      console.error("❌ Error al guardar seguimiento:", error);
      alert("❌ Hubo un error al guardar el seguimiento.");
    }
  };


  // Load students, periods, and levels
  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      //setPredicciones({}); // Clear previous predictions

      // Depuración: Ver que nivel se está enviando
      console.log("🚀 Cargando estudiantes para nivel:", nivelSeleccionado);

      // Cargar solo estudiantes del periodo 202450 y el nivel seleccionado
      const data = await obtenerEstudiantesFiltrados(nivelSeleccionado, "202450");

      console.log("✅ Estudiantes obtenidos en frontend:", data); // Ver si Llegan estudiantes

      if (data.length > 0) {
        // Filtrar estudiantes duplicados por ID
        const uniqueEstudiantes = Array.from(new Set(data.map(est => est.id_estudiante)))
          .map(id => data.find(est => est.id_estudiante === id));

        setEstudiantes(uniqueEstudiantes);
        setError(null);
      } else {
        //setEstudiantes([]); // Ensure the table is empty when no students are found
        setShowNoResultsModal(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setShowNoResultsModal(true);
      } else {
        console.error("❌ Error al cargar los estudiantes:", err);
        setError('Error al cargar los estudiantes. Intenta nuevamente.');
        console.log("Error al obtener estudiantes:", err);
        //setEstudiantes([]); // Ensure the table is empty on error
      }

      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // 🔥 Guardar estudiantes en localStorage
  useEffect(() => {
    if (estudiantes.length > 0) {
      localStorage.setItem("estudiantesData", JSON.stringify(estudiantes));
    }
  }, [estudiantes]);

  // 🔥 Recuperar estudiantes cuando se monta el componente
  useEffect(() => {
    const storedEstudiantes = localStorage.getItem("estudiantesData");
    if (storedEstudiantes) {
      setEstudiantes(JSON.parse(storedEstudiantes));
    } else {
      //setEstudiantes([]); // Ensure the table is empty on initial load
    }
  }, []);

  // PARA PREDICCIONES del modelo
  useEffect(() => {
    const cargarPredicciones = async () => {
      try {
        const data = await obtenerPredicciones();
        setPredicciones(data);
      } catch (error) {
        console.error("Error al cargar predicciones:", error);
        // Handle the error appropriately in the UI
      }
    };

    cargarPredicciones();
  }, []);




  // Obtener periodos activos
  useEffect(() => {
    const fetchPeriodoActivo = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/periodos/periodo-activo");
        setPeriodoActivo(response.data.periodo);
      } catch (error) {
        console.error("Error al obtener período activo:", error);
      }
    };

    fetchPeriodoActivo();
  }, []);

  // Obtener las predicciones desde el backend (similar a como se hace en el useEffect actual)
  useEffect(() => {

    const storedPredicciones = localStorage.getItem("prediccionesData");
    if (storedPredicciones) {
      setPredicciones(JSON.parse(storedPredicciones));
    }

    const fetchPredicciones = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/estudiantes/predicciones");

        if (response.data.predicciones && response.data.predicciones.length > 0) {
          const prediccionesMap = {};
          const nivelesSet = new Set();

          response.data.predicciones.forEach(pred => {
            prediccionesMap[pred.id_estudiante] = {
              nombres: pred.nombres,
              apellidos: pred.apellidos,
              probabilidad: pred.probabilidad,
              nivelRiesgo: pred.nivel_riesgo,
              periodo: pred.periodo,
              nivel_referencial: pred.nivel_referencial,
            };

            if (pred.nivel_referencial && pred.nivel_referencial !== "NULL" && pred.nivel_referencial !== "N/A") {
              nivelesSet.add(pred.nivel_referencial.trim());
            }
          });

          setPredicciones(prediccionesMap);

          // Add ordenarNiveles here
          const nivelesOrdenados = ordenarNiveles(Array.from(nivelesSet));
          setNivelesDisponibles(nivelesOrdenados);

          console.log("📊 Niveles ordenados:", nivelesOrdenados);
        } else {
          console.warn("⚠️ No se encontraron predicciones en la base de datos.");
          setPredicciones({});
        }
      } catch (error) {
        console.error("❌ Error al cargar predicciones:", error);
        setError("Error al cargar predicciones");
      } finally {
        setLoading(false);
      }
    };


    fetchPredicciones();
  }, []); // ⚠️ Solo se ejecuta cuando se monta el componente, no cada vez que se filtra.


  // 🔥 Obtener predicciones y fusionar datos
  const estudiantesConPred = Array.isArray(predicciones) ? predicciones : [];


  // 🔥 Crear un mapa de predicciones para acceso rápido
  const prediccionesMap = {};
  estudiantesConPred.forEach(pred => {
    if (pred.id_estudiante) {
      prediccionesMap[pred.id_estudiante] = {
        probabilidad: pred.probabilidad,
        nivelRiesgo: pred.nivel_riesgo,
        nivelReferencial: pred.nivel_referencial || "N/A"
      };
    }
  });

  // Estado para almacenar los niveles disponibles en el select
  const [nivelesDisponibles, setNivelesDisponibles] = useState([]);

  // Define el orden personalizado para los niveles
  const ordenNiveles = [
    'PRIMER NIVEL', 'SEGUNDO NIVEL', 'TERCER NIVEL', 'CUARTO NIVEL',
    'QUINTO NIVEL', 'SEXTO NIVEL', 'SEPTIMO NIVEL', 'OCTAVO NIVEL'
  ];

  // Función para ordenar los niveles según el orden personalizado
  const ordenarNiveles = (niveles) => {
    return niveles.sort((a, b) => ordenNiveles.indexOf(a) - ordenNiveles.indexOf(b));
  };


  // 🔥 Obtener predicciones y fusionar datos (con useMemo para evitar renders innecesarios)
  const estudiantesAMostrar = useMemo(() => {
    // Crear un mapa de predicciones para acceso rápido
    const prediccionesMap = Object.fromEntries(
      Object.entries(predicciones).map(([id, pred]) => [
        id.toString().trim(), // Asegurar que la clave sea un string trimmed
        {
          nombres: pred.nombres ? String(pred.nombres).trim().toUpperCase() : "DESCONOCIDO",
          apellidos: pred.apellidos ? String(pred.apellidos).trim().toUpperCase() : "DESCONOCIDO",
          probabilidad: pred.probabilidad ? parseFloat(pred.probabilidad) : 0,
          nivelRiesgo: pred.nivelRiesgo || "N/A",
          nivelReferencial: pred.nivel_referencial || "SIN DEFINIR"
        }
      ])
    );
  
    // Normalizar estudiantes
    const currentStudents = estudiantes.map(est => {
      // Convertir id a string y trimear
      const estId = est.id_estudiante ? String(est.id_estudiante).trim() : "N/A";
      
      // Obtener predicción para este estudiante
      const prediccion = prediccionesMap[estId] || {};
  
      return {
        // Campos base del estudiante con valores por defecto
        id_estudiante: estId,
        nombres: est.nombres ? String(est.nombres).trim().toUpperCase() : "DESCONOCIDO",
        apellidos: est.apellidos ? String(est.apellidos).trim().toUpperCase() : "DESCONOCIDO",
        
        // Combinar datos de estudiante y predicción
        probabilidad: prediccion.probabilidad !== undefined && prediccion.probabilidad !== 0
          ? prediccion.probabilidad
          : (predicciones[estId]?.probabilidad 
              ? parseFloat(predicciones[estId].probabilidad) 
              : 0),
        nivelRiesgo: prediccion.nivelRiesgo || 
          predicciones[estId]?.nivelRiesgo || 
          "N/A",
        nivelReferencial: prediccion.nivelReferencial || 
          predicciones[estId]?.nivel_referencial || 
          est.nivel || 
          "SIN DEFINIR",
        
        // Campos adicionales de estudiante
        periodo: est.periodo || "N/A",
        nivel: est.nivel || "SIN DEFINIR"
      };
    });
  
    // Agregar predicciones que no tienen correspondencia con estudiantes
    const additionalPredictions = Object.entries(prediccionesMap)
      .filter(([id]) => !estudiantes.some(est => String(est.id_estudiante).trim() === id))
      .map(([id, pred]) => ({
        id_estudiante: id,
        nombres: pred.nombres,
        apellidos: pred.apellidos,
        probabilidad: pred.probabilidad,
        nivelRiesgo: pred.nivelRiesgo,
        nivelReferencial: pred.nivelReferencial,
        periodo: "N/A",
        nivel: "SIN DEFINIR"
      }));
  
    // Combinar y eliminar duplicados
    const combinedStudents = [
      ...currentStudents,
      ...additionalPredictions
    ];
  
    // Eliminar duplicados por ID y limpiar
    const uniqueStudents = Array.from(
      new Map(
        combinedStudents.map(item => [
          item.id_estudiante, 
          {
            id_estudiante: String(item.id_estudiante).trim(),
            nombres: String(item.nombres).trim().toUpperCase(),
            apellidos: String(item.apellidos).trim().toUpperCase(),
            probabilidad: item.probabilidad !== undefined ? parseFloat(item.probabilidad) : 0,
            nivelRiesgo: item.nivelRiesgo || "N/A",
            nivelReferencial: item.nivelReferencial || "SIN DEFINIR",
            periodo: item.periodo || "N/A",
            nivel: item.nivel || "SIN DEFINIR"
          }
        ])
      ).values()
    );
  
    return uniqueStudents;
  }, [estudiantes, predicciones]);

  // ⚠️ Solo se recalcula cuando `estudiantes` o `predicciones` cambian

  console.log("📌 EstudiantesAMostrar FINAL:", estudiantesAMostrar);
  console.log("📊 Todos los niveles encontrados en estudiantesAMostrar:", estudiantesAMostrar.map(e => e.nivel_referencial || e.nivel));



  useEffect(() => {
    // Recuperar niveles de localStorage si existen
    const storedNiveles = localStorage.getItem("nivelesDisponibles");
    if (storedNiveles) {
      setNivelesDisponibles(JSON.parse(storedNiveles));
    }
  }, []);
  useEffect(() => {
    console.log("📡 Estudiantes normalizados:", 
      JSON.stringify(estudiantesAMostrar, null, 2)
    );
    
    // Log para verificar estructura de un estudiante
    if (estudiantesAMostrar.length > 0) {
      console.log("🔍 Estructura de un estudiante de ejemplo:", 
        JSON.stringify(estudiantesAMostrar[0], null, 2)
      );
      
      // Verificar tipos de datos
      console.log("🧐 Tipos de datos:", 
        estudiantesAMostrar.map(est => ({
          id_estudiante: typeof est.id_estudiante,
          nombres: typeof est.nombres,
          apellidos: typeof est.apellidos,
          probabilidad: typeof est.probabilidad,
          nivelRiesgo: typeof est.nivelRiesgo,
          nivelReferencial: typeof est.nivelReferencial
        }))
      );
    }
  }, [estudiantesAMostrar]);

  // 🔥 Obtener y actualizar los niveles disponibles SOLO cuando se cargan predicciones
  useEffect(() => {
    // Obtener todos los niveles únicos de los estudiantes
    const nivelesUnicos = [...new Set(
      estudiantesAMostrar
        .map(est => est.nivelReferencial || est.nivel)
        .filter(nivel => nivel && nivel !== "N/A" && nivel !== "NULL" && nivel !== "SIN DEFINIR")
        .map(nivel => nivel.trim())
    )];

    // Asegurarse de incluir todos los niveles del orden predefinido
    const todosLosNiveles = [...new Set([...ordenNiveles, ...nivelesUnicos])];

    // Ordenar los niveles según el orden personalizado
    const nivelesOrdenados = ordenarNiveles(todosLosNiveles);

    console.log("Estudiantes a mostrar:", estudiantesAMostrar);
    // Solo actualizar si hay cambios para evitar renders innecesarios
    /*if (nivelesOrdenados.length > 0 && JSON.stringify(nivelesOrdenados) !== JSON.stringify(nivelesDisponibles)) {
      setNivelesDisponibles(nivelesOrdenados);
      localStorage.setItem("nivelesDisponibles", JSON.stringify(nivelesOrdenados)); // Guardar niveles
    }*/
    setNivelesDisponibles(nivelesOrdenados);
    localStorage.setItem("nivelesDisponibles", JSON.stringify(nivelesOrdenados));

    console.log("📌 Niveles disponibles en select:", nivelesOrdenados);
  }, [estudiantesAMostrar]); // ⚠️ Se ejecuta cuando los estudiantes cambian, no al filtrar


  // 🔥 Filtrar estudiantes por nivel seleccionado (con useMemo para optimizar)
  const estudiantesFiltradosPorNivel = useMemo(() => {
    if (!nivelSeleccionado) return estudiantesAMostrar;

    return estudiantesAMostrar.filter(est =>
      (est.nivelReferencial?.trim().toLowerCase() || est.nivel?.trim().toLowerCase()) ===
      nivelSeleccionado.trim().toLowerCase()
    );
  }, [estudiantesAMostrar, nivelSeleccionado]);

  console.log("👀 Estudiantes filtrados por nivel:", estudiantesFiltradosPorNivel);

  // 🔎 Aplicar filtro de búsqueda
  const estudiantesFiltrados = estudiantesFiltradosPorNivel.filter(est =>
    (est.nombres || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (est.apellidos || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (est.id_estudiante || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📌 Paginación
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentPaginatedStudents = estudiantesFiltrados.slice(indexOfFirstStudent, indexOfLastStudent);




  // 📌 Verificar que nivelSeleccionado tiene un valor
  console.log("Nivel seleccionado:", nivelSeleccionado);

  // 🔥 Obtener niveles disponibles de estudiantes y predicciones
  const getAllEstudiantes = () => {
    // Asegurarse de que estamos trabajando con un array de objetos que tienen la propiedad nivel_referencial
    return Array.isArray(estudiantes) ? estudiantes : [];
  };

  // Primero obtenemos todos los estudiantes
  const allEstudiantes = getAllEstudiantes();


  if (estudiantes.length > 0) {
    console.log("📊 Objeto de estudiante de ejemplo:", estudiantes[0]);
    console.log("📊 Propiedades disponibles:", Object.keys(estudiantes[0]));
    console.log("📊 Valor de nivel_referencial:", estudiantes[0].nivel_referencial);
    console.log("📊 Valor de nivelReferencial:", estudiantes[0].nivelReferencial);
  }


  console.log("📌 Niveles disponibles en select (después de corregir):", nivelesDisponibles);

  console.log("📌 Total estudiantes para extraer niveles:", allEstudiantes.length);
  console.log("📌 Niveles disponibles en select (después de fix):", nivelesDisponibles);

  console.log("📌 Niveles disponibles en select (después de asignar):", nivelesDisponibles);



  console.log("📊 Estudiantes completos antes de extraer niveles:", estudiantesAMostrar);

  console.log("📌 Estudiantes en la tabla FINAL:", estudiantesAMostrar);


  // 🔥 Manejo del modal de "Sin Resultados"
  const handleCloseNoResultsModal = () => {
    setShowNoResultsModal(false);
    setPeriodoSeleccionado('');
    setNivelSeleccionado('');
  };
  // 🔥 Función para manejar cambios en la búsqueda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toUpperCase()); // 🔚 Convertir a mayúsculas para búsqueda insensible a minúsculas 
  };

  const cargarHistorialAcademico = async (id) => {
    if (!id) {
      console.error("ID del estudiante no definido");
      return;
    }
    try {
      const data = await obtenerHistorialAcademico(`http://localhost:5000/api/estudiantes/historial/${id}`);
      const historialArray = Array.isArray(data) ? data : [data];
      setHistorialModal(historialArray);
    } catch (err) {
      console.error('Error al cargar el historial académico:', err);
    }
  };

  const handleVerHistorial = async (id) => {
    try {
      const historial = await obtenerHistorialAcademico(id);
      // Asegúrate de que es un array
      const historialArray = Array.isArray(historial) ? historial : [historial];
      setHistorialModal(historialArray);
    } catch (err) {
      console.error('Error al cargar el historial:', err);
      setError('No se pudo cargar el historial del estudiante');
    }
    console.log("Historial del estudiante:", estudiantes.historial);
  };

  const closeHistorialModal = () => {
    setHistorialModal(null);
  };


  const cargarPeriodos = async () => {
    try {
      const data = await obtenerPeriodos();
      setPeriodos(data);
    } catch (err) {
      console.error('Error al cargar los períodos:', err);
    }
  };

  const cargarNiveles = async () => {
    try {
      const data = await obtenerNiveles();
      setNiveles(data);
    } catch (err) {
      console.error('Error al cargar los niveles:', err);
    }
  };

  useEffect(() => {
    cargarPeriodos();
    cargarNiveles();
  }, []);

  useEffect(() => {
    if (nivelSeleccionado) {
      console.log("Nivel cambiado, cargando estudiantes...");
      cargarEstudiantes();
    }
  }, [nivelSeleccionado]); // 🔥 Se ejecuta cuando cambia el nivel

  useEffect(() => {
    if (id) {
      cargarHistorialAcademico(id);
    }
  }, [id]);

  useEffect(() => {
    console.log('Contenido historialModal:', historialModal);
  }, [historialModal]);


  const handlePredecirTodos = async () => {
    try {
      setLoading(true);

      // 1️⃣ Obtener historial académico en paralelo
      const estudiantesConHistorial = await Promise.all(
        estudiantes.map(async (est) => {
          const historial = await obtenerHistorialAcademico(est.id_estudiante).catch(() => []);
          return {
            ...est,
            historial,
            promedio: historial.length > 0
              ? historial.reduce((acc, curr) => acc + curr.promedio, 0) / historial.length
              : est.promedio_anterior || 14.5
          };
        })
      );

      // 2️⃣ Filtrar estudiantes válidos
      const estudiantesValidos = estudiantesConHistorial.filter(e => e.historial.length > 0);
      if (estudiantesValidos.length === 0) {
        throw new Error('No hay estudiantes con historial válido');
      }

      // 3️⃣ Dividir estudiantes en bloques de 20 para evitar saturar el servidor
      const BLOCK_SIZE = 20;
      let prediccionesTemp = { ...predicciones };

      for (let i = 0; i < estudiantesValidos.length; i += BLOCK_SIZE) {
        const bloque = estudiantesValidos.slice(i, i + BLOCK_SIZE);

        // 🔥 Enviar el bloque al backend
        const response = await realizarPrediccionesMultiples({ estudiantes: bloque });

        // 4️⃣ Guardar las predicciones en localStorage y en estado
        Object.entries(response.predicciones).forEach(([id, prediccion]) => {
          const estudiante = bloque.find(e => e.id_estudiante === id);
          if (prediccion && estudiante) {
            prediccionesTemp[id] = {
              ...prediccion,
              nombres: estudiante.nombres,
              apellidos: estudiante.apellidos,
              nivel_referencial: estudiante.nivel
            };
          }
        });

        setPredicciones(prev => {
          const actualizado = { ...prev, ...prediccionesTemp };
          localStorage.setItem("prediccionesData", JSON.stringify(actualizado));
          return actualizado;
        });

        console.log(`📊 Progreso: ${Math.round(((i + BLOCK_SIZE) / estudiantesValidos.length) * 100)}%`);
      }

      // 5️⃣ Actualizar estudiantes en riesgo
      setEstudiantesConRiesgo(
        estudiantesValidos.filter(est =>
          prediccionesTemp[est.id_estudiante]?.probabilidad >= 0.4
        )
      );

      // 6️⃣ Mostrar modal de éxito
      setShowConfirmModal(true);

    } catch (error) {
      console.error("❌ Error al predecir:", error);
      setError(`Error al realizar predicciones: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  console.log("📡 Estudiantes enviados a predecir:", estudiantesAMostrar);

  // 🔥 Función para asignar color según el nivel de riesgo
  const getColorForProbability = (probabilidad) => {
    if (typeof probabilidad === "string" && probabilidad === "No predecido") {
      return "bg-gray-100";
    }

    const prob = parseFloat(probabilidad);
    if (isNaN(prob)) return "bg-gray-100"; // ⚠️ Si sigue sin ser un número, fondo gris

    if (prob >= 0.50) return "bg-red-300 text-black";  // 🔥 Rojo menos intenso
    if (prob >= 0.40) return "bg-yellow-200 text-black"; // ⚠️ Amarillo más suave
    return "bg-green-100 text-black";                    // ✅ Verde más suave
  };



  // Función para formatear la probabilidad
  const formatProbability = (probabilidad, nivelRiesgo) => {
    if (!probabilidad || probabilidad === "No predecido" || probabilidad === "N/A") {
      return {
        valor: "No predecido",
        nivel: "N/A"
      };
    }

    const prob = parseFloat(probabilidad);
    if (isNaN(prob)) {
      return {
        valor: "Error",
        nivel: "N/A"
      };
    }

    return {
      valor: `${(prob * 100).toFixed(2)}%`,
      nivel: nivelRiesgo || "Desconocido"
    };
  };


  const handleEnviarReportes = () => {
    if (estudiantesConRiesgo.length === 0) return;

    // Asegurar que las predicciones sean válidas antes de enviarlas
    const estudiantesValidos = estudiantesConRiesgo.map(est => {
      const prediccion = predicciones[est.id_estudiante] || { probabilidad: 0, nivelRiesgo: "BAJO" };

      return {
        id_estudiante: est.id_estudiante,
        nombres: est.nombres,
        apellidos: est.apellidos,
        probabilidad: prediccion.probabilidad ?? 0, // ✅ Evitar NaN
        nivelRiesgo: prediccion.nivelRiesgo || "BAJO", // ✅ Evitar undefined
        promedio: est.promedio, // Asegúrate de que el promedio esté incluido
        periodo: est.periodo || periodoActivo || 'PERIODO_DESCONOCIDO',
      };
    });

    console.log("📡 Enviando a Bienestar:", estudiantesValidos);

    navigate("/predicciones", {
      state: {
        estudiantesRiesgo: estudiantesValidos.map(est => ({
          ...est,
          // Usar el periodo directamente de los datos
          periodo: est.periodo
        })),
        predicciones,
        periodoActivo
      }
    });

    setShowConfirmModal(false);
  };


  const handleCancelarReportes = () => {
    setShowConfirmModal(false);
  };

  // 📌 Paginación
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(estudiantes.length / studentsPerPage);

  const visiblePages = () => {
    let start = Math.max(1, currentPage - 5);
    let end = Math.min(totalPages, currentPage + 5);
    let pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><CircularProgress size={50} /></div>;

  // RETURN PARA LOS DATOS DE LAS TABLA, MODALS, CARGA,ETC

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Predicción de Riesgo de Deserción</h1>

      {/* Selección de Filtros y Barra de Búsqueda */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-600">
            {/* Muestra el período activo obtenido desde el backend */}
            <p>Período Actual: {periodoActivo || 'Cargando...'}</p>
          </div>

          <select
            value={nivelSeleccionado}
            onChange={(e) => setNivelSeleccionado(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            disabled={loading}
          >
            <option value="">Seleccionar Nivel</option>
            {nivelesDisponibles.length > 0 ? (
              nivelesDisponibles.map((nivel, index) => (
                <option key={index} value={nivel}>
                  {nivel}
                </option>
              ))
            ) : (
              <option disabled>No hay niveles disponibles</option>
            )}
          </select>

          {loading && (
            <div className="text-center">
              <div className="mb-2">Procesando estudiantes...</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>
              <div className="mt-2">{progreso}% completado</div>
            </div>
          )}

          <button
            onClick={handlePredecirTodos}
            className={`
          flex items-center justify-center 
          px-4 py-2.5 
          bg-gradient-to-r from-blue-500 to-blue-600 
          text-white 
          rounded-lg 
          shadow-md 
          hover:shadow-lg 
          transition-all 
          duration-300 
          ease-in-out
          ${(!nivelSeleccionado || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-700'}
        `}
            disabled={!nivelSeleccionado || loading}
          >
            {loading ? (
              <div className="animate-spin">
                <ListFilter className="w-5 h-5" />
              </div>
            ) : (
              <>
                <ListFilter className="mr-2 w-5 h-5" />
                Predecir Todos
              </>
            )}
          </button>
        </div>


        {/* 🔍 Barra de búsqueda */}
        <div className="relative w-80"> {/* Reducido el ancho a w-64 (256px) */}
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-8 pr-2 py-2 
                   border border-gray-300 rounded-md 
                   text-sm 
                   focus:outline-none focus:ring-1 focus:ring-blue-500 
                   focus:border-transparent"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Search
            className="absolute left-2 top-1/2 transform -translate-y-1/2 
                   text-gray-400 w-4 h-4"
          />
        </div>
      </div>

      {/* Tabla de estudiantes */}
      <div className="p-6">
        {loading ? (
          <p>Cargando predicciones...</p>
        ) : error ? (

          <p>{error}</p>
        ) : (
          <>
            {/* Si no hay estudiantes después del filtro, mostrar mensaje */}
            {currentPaginatedStudents.length === 0 ? (
              <p className="text-red-500 text-center">No hay estudiantes en este nivel o búsqueda.</p>
            ) : (
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2">Nombres</th>
                    <th className="border px-4 py-2">Apellidos</th>
                    <th className="border px-4 py-2">Probabilidad de Deserción</th>
                    <th className="border px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPaginatedStudents.map((estudiante, index) => {
                    let { valor, nivel } = formatProbability(
                      estudiante.probabilidad,
                      estudiante.nivelRiesgo
                    );

                    if (!estudiante.probabilidad || estudiante.probabilidad === "N/A") {
                      valor = "No predecido";
                      nivel = "";
                    }

                    return (
                      <tr
                        key={`${estudiante.id_estudiante || index}`}
                        className={getColorForProbability(estudiante.probabilidad, estudiante.nivelRiesgo)}>
                        {/* ✅ Forzar el ID a string para evitar conversión a número */}
                        <td className="border px-4 py-2">{String(estudiante.id_estudiante) || "N/A"}</td>
                        <td className="border px-4 py-2">{estudiante.nombres || "Desconocido"}</td>
                        <td className="border px-4 py-2">{estudiante.apellidos || "Desconocido"}</td>
                        <td className="border px-4 py-2">
                          {valor === "No predecido" ? (
                            <span className="text-gray-500">No predecido</span>
                          ) : (
                            <div>
                              <span className="font-bold">{valor}</span>
                              <span className="ml-2 text-sm">({nivel})</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-2">
                          <button
                            onClick={() => handleVerHistorial(estudiante.id_estudiante)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Ver Historial
                          </button>

                          {currentUser?.role === "DOCENTE" && (
                            <button
                              onClick={() => handleAbrirSeguimiento(estudiante)}
                              className="ml-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Registrar Seguimiento
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            )}

            {/* Paginación */}
            {currentPaginatedStudents.length > 0 && (
              <div className="flex justify-center items-center mt-4">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 mr-2 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-700"
                    }`}
                >
                  Anterior
                </button>

                {visiblePages().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`px-3 py-2 mx-1 rounded ${currentPage === pageNumber ? "bg-blue-700 text-white" : "bg-gray-200 hover:bg-gray-300"
                      }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 ml-2 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-700"
                    }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>


      {/* Modal de Historial */}
      {historialModal && Array.isArray(historialModal) && historialModal.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-2/3 shadow-lg max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Historial Académico</h2>
            <div className="overflow-auto max-h-96">
              <table className="min-w-full table-auto border-collapse">
                <thead className="sticky top-0 bg-blue-500 text-white">
                  <tr>
                    <th className="border px-4 py-2">Período</th>
                    <th className="border px-4 py-2">Asignatura</th>
                    <th className="border px-4 py-2">Nota 1P</th>
                    <th className="border px-4 py-2">Nota 2P</th>
                    <th className="border px-4 py-2">Nota 3P</th>
                    <th className="border px-4 py-2">Promedio</th>
                    <th className="border px-4 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historialModal.map((registro, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-100">
                      <td className="border px-4 py-2 text-center">{registro.periodo}</td>
                      <td className="border px-4 py-2 text-center">{registro.nombre_asignatura}</td>
                      <td className="border px-4 py-2 text-center">{registro.nota_1p}</td>
                      <td className="border px-4 py-2 text-center">{registro.nota_2p}</td>
                      <td className="border px-4 py-2 text-center">{registro.nota_3p}</td>
                      <td className="border px-4 py-2 text-center">{registro.promedio}</td>
                      <td className="border px-4 py-2 text-center">{registro.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right mt-4">
              <button
                onClick={closeHistorialModal}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sin Resultados */}
      {showNoResultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-red-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Sin Resultados</h2>
              <p className="text-gray-600 mb-4">
                No se encontraron estudiantes para el nivel "{nivelSeleccionado}"
                y el período "{periodoSeleccionado}".
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCloseNoResultsModal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Seleccionar Nuevos Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Confirmación de Predicción</h2>
            <p className="mb-4">
              Se han identificado {estudiantesConRiesgo.length} estudiantes
              con probabilidad de deserción.
            </p>
            <p className="mb-4">¿Desea enviar estos estudiantes a Bienestar Estudiantil?</p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleEnviarReportes}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
              >
                Sí, Enviar
              </button>
              <button
                onClick={handleCancelarReportes}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                No, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seguimiento */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Registrar Seguimiento
            </h2>
            <p className="mb-2">
              Estudiante: <strong>{estudianteSeleccionado?.nombres} {estudianteSeleccionado?.apellidos}</strong>
            </p>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe un comentario..."
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleGuardarSeguimiento}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
              >
                Guardar
              </button>
              <button
                onClick={handleCerrarSeguimiento}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 ml-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EstudiantesPage;