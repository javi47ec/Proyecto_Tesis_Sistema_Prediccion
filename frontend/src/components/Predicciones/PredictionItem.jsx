import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const PredictionItem = ({ prediccion = {
  id: 0,
  estudiante: {
    id: 0,
    nombre: 'Sin nombre',
    promedio: 0,
    materiasReprobadas: 0
  },
  probabilidad: 0,
  accion: ''
}, onActualizarAccion }) => {
  const [mostrarFormAccion, setMostrarFormAccion] = useState(false);
  const [accion, setAccion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const guardarAccion = async () => {
    try {
      setGuardando(true);
      const response = await fetch(`/api/predicciones/${prediccion.id}/accion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accion }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la acción');
      }

      if (onActualizarAccion) {
        onActualizarAccion(accion);
      }
      setMostrarFormAccion(false);
      setAccion('');
    } catch (error) {
      console.error('Error al guardar acción:', error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{prediccion.estudiante.nombre}</h3>
            <p className="text-sm text-gray-600">ID: {prediccion.estudiante.id}</p>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${
              prediccion.probabilidad >= 70 ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {prediccion.probabilidad.toFixed(1)}%
            </span>
            <p className="text-sm text-gray-600">Probabilidad de reprobación</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Historial Académico</h4>
            <p>Promedio: {prediccion.estudiante.promedio.toFixed(2)}</p>
            <p>Materias Reprobadas: {prediccion.estudiante.materiasReprobadas}</p>
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

export default PredictionItem;