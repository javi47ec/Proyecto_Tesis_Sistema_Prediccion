import React from 'react';
import { useState, useEffect } from 'react';
import logo from './assets/logo_itin.png';

// Imágenes para el slider (Asegúrate de tenerlas en tu carpeta 'assets')
import slide1 from './assets/apoyoBienestar.jpg';
import slide2 from './assets/imagen_studen1.jpg';
import slide3 from './assets/imagen_studen2.jpg';
import slide4 from './assets/estudianteslaptop.jpg';

const slides = [slide1, slide2, slide3, slide4];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 4000); // Cambia de imagen cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Encabezado */}
      <header className="w-full py-4 bg-blue-600 text-white text-center text-xl font-semibold shadow-md flex items-center justify-center">
        <img src={logo} alt="Logo" className="w-12 h-12 mr-2" />
        Bienvenido al Sistema de Gestión Académica
      </header>

      {/* Slider */}
      <div className="relative w-full max-w-4xl h-64 md:h-96 overflow-hidden shadow-lg rounded-lg mt-6">
        <img
          src={slides[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
        />
      </div>

      {/* Texto de Bienvenida */}
      <div className="text-center mt-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenido al Sistema de Gestión Académica
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Aquí podrás analizar datos estadísticos, generar reportes y realizar predicciones generales.
        </p>
      </div>

      {/* Pie de Página */}
      <footer className="w-full py-6 mt-10 bg-gray-800 text-white text-center">
        <p className="text-lg font-semibold">Carrera de Tecnologías de la Información - Universidad ESPE</p>
        <p className="text-sm mt-2">© 2025 Todos los derechos reservados.</p>
        <p className="text-sm mt-1">Contacto: <a href="mailto:ube@espe.edu.ec" className="underline">espe.edu.ec</a></p>
      </footer>
    </div>
  );
}

export default Home;
