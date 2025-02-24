import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const PredictionList = () => {
  const [predicciones, setPredicciones] = useState([]);
  const [umbral, setUmbral] = useState(70);
  const [loading, setLoading] = useState(false);

  const realizarPrediccion = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/predicciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ umbral }),
      });
      const nuevasPredicciones = await response.json();
      setPredicciones(nuevasPredicciones);
    } catch (error) {
      console.error('Error al realizar predicciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarAccion = async (prediccionId, accion) => {
    try {
      await fetch(`/api/predicciones/${prediccionId}/accion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accion }),
      });
      
      const nuevasPredicciones = predicciones.map(p =>
        p.id === prediccionId ? { ...p, accion } : p
      );
      setPredicciones(nuevasPredicciones);
    } catch (error) {
      console.error('Error al guardar acción:', error);
    }
  };

  const PredictionItem = ({ prediccion }) => {
    const [mostrarFormAccion, setMostrarFormAccion] = useState(false);
    const [accion, setAccion] = useState('');
    const [guardando, setGuardando] = useState(false);

    const guardarAccion = async () => {
      try {
        setGuardando(true);
        await actualizarAccion(prediccion.id, accion);
        setMostrarFormAccion(false);
        setAccion('');
      } catch (error) {
        console.error('Error al guardar acción:', error);
      } finally {
        setGuardando(false);
      }
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{prediccion.estudiante?.nombre || 'Estudiante sin nombre'}</h3>
              <p className="text-sm text-gray-600">ID: {prediccion.estudiante?.id || 'N/A'}</p>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${
                prediccion.probabilidad >= 70 ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {prediccion.probabilidad?.toFixed(1) || 0}%
              </span>
              <p className="text-sm text-gray-600">Probabilidad de reprobación</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Historial Académico</h4>
              <p>Promedio: {prediccion.estudiante?.promedio?.toFixed(2) || '0.00'}</p>
              <p>Materias Reprobadas: {prediccion.estudiante?.materiasReprobadas || 0}</p>
            </div>

            {prediccion.accion ? (
              <div>
                <h4 className="font-medium mb-2">Acción Tomada:</h4>
                <p className="text-gray-700">{prediccion.accion}</p>
              </div>
            ) : mostrarFormAccion ? (
              <div className="space-y-2">
                <Textarea
                  value={accion}
                  onChange={(e) => setAccion(e.target.value)}
                  placeholder="Describa la acción a tomar..."
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={guardarAccion}
                    disabled={guardando || !accion.trim()}
                  >
                    {guardando ? 'Guardando...' : 'Guardar Acción'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setMostrarFormAccion(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => setMostrarFormAccion(true)}
                variant="outline"
              >
                Agregar Acción
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Umbral:</label>
          <Input
            type="number"
            value={umbral}
            onChange={(e) => setUmbral(Number(e.target.value))}
            className="w-24"
            min="0"
            max="100"
          />
          <span className="text-sm">%</span>
        </div>
        <Button 
          onClick={realizarPrediccion}
          disabled={loading}
        >
          {loading ? 'Prediciendo...' : 'Realizar Predicción'}
        </Button>
      </div>

      <div className="space-y-4">
        {predicciones
          .sort((a, b) => b.probabilidad - a.probabilidad)
          .map((prediccion) => (
            <PredictionItem
              key={prediccion.id}
              prediccion={prediccion}
            />
          ))}
      </div>
    </div>
  );
};

export default PredictionList;