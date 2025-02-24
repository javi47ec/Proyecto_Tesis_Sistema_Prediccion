import React from 'react';
import { Table } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const HistorialAcademico = () => {
  // Datos de ejemplo que simulan el formato de tu Excel
  const datosEjemplo = [
    {
      id: "1",
      nombres: "Juan Pérez",
      cedula: "1234567890",
      areaConocimiento: "Ingeniería",
      departamento: "Sistemas",
      curso: "Programación",
      asignatura: "Desarrollo Web",
      nrc: "12345",
      componentes: "Teórico-Práctico",
      campo: "Profesional",
      estado: "Aprobado",
      creditos: 4,
      promedio1P: 8.5,
      promedio2P: 9.0,
      promedio3P: 8.8,
      promedio1P2P: 8.75,
      comentarioDocente: "Excelente desempeño",
      nivelReferencial: "3"
    },
    {
      id: "2",
      nombres: "Juan Pérez",
      cedula: "1234567890",
      areaConocimiento: "Ingeniería",
      departamento: "Sistemas",
      curso: "Base de Datos",
      asignatura: "SQL Avanzado",
      nrc: "12346",
      componentes: "Teórico-Práctico",
      campo: "Profesional",
      estado: "Aprobado",
      creditos: 4,
      promedio1P: 7.5,
      promedio2P: 8.0,
      promedio3P: 8.5,
      promedio1P2P: 7.75,
      comentarioDocente: "Buen progreso",
      nivelReferencial: "3"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Historial Académico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th className="p-2 font-semibold text-left">Nombres</th>
                <th className="p-2 font-semibold text-left">Cédula</th>
                <th className="p-2 font-semibold text-left">Área</th>
                <th className="p-2 font-semibold text-left">Asignatura</th>
                <th className="p-2 font-semibold text-left">NRC</th>
                <th className="p-2 font-semibold text-center">Créditos</th>
                <th className="p-2 font-semibold text-center">1P</th>
                <th className="p-2 font-semibold text-center">2P</th>
                <th className="p-2 font-semibold text-center">3P</th>
                <th className="p-2 font-semibold text-center">1P+2P</th>
                <th className="p-2 font-semibold text-left">Estado</th>
                <th className="p-2 font-semibold text-left">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {datosEjemplo.map((registro, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{registro.nombres}</td>
                  <td className="p-2">{registro.cedula}</td>
                  <td className="p-2">{registro.areaConocimiento}</td>
                  <td className="p-2">{registro.asignatura}</td>
                  <td className="p-2">{registro.nrc}</td>
                  <td className="p-2 text-center">{registro.creditos}</td>
                  <td className="p-2 text-center">{registro.promedio1P}</td>
                  <td className="p-2 text-center">{registro.promedio2P}</td>
                  <td className="p-2 text-center">{registro.promedio3P}</td>
                  <td className="p-2 text-center">{registro.promedio1P2P}</td>
                  <td className="p-2">{registro.estado}</td>
                  <td className="p-2">{registro.comentarioDocente}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistorialAcademico;