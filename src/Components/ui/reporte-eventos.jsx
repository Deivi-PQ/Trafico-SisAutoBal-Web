import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

const ReporteEventos = () => {
  const [filtrosReporte, setFiltrosReporte] = useState({
    fechaInicio: "",
    fechaFin: "",
    codBatch: "",
    tipoEvento: ""
  });

  const handleInputChange = (field, value) => {
    setFiltrosReporte(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerarReporte = () => {
    // Aquí se implementará la lógica para generar el PDF
    console.log("Generando reporte con filtros:", filtrosReporte);
    // Por ahora solo mostraremos un mensaje
    alert("Funcionalidad de reporte en desarrollo");
  };

  const handleLimpiarFiltros = () => {
    setFiltrosReporte({
      fechaInicio: "",
      fechaFin: "",
      codBatch: "",
      tipoEvento: ""
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros para el reporte */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Button icon="filter" variant="ghost" size="sm" />
          <h3 className="text-lg font-semibold">Filtros para Reporte</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha Inicio</label>
            <Input
              type="date"
              value={filtrosReporte.fechaInicio}
              onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha Fin</label>
            <Input
              type="date"
              value={filtrosReporte.fechaFin}
              onChange={(e) => handleInputChange("fechaFin", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Código Batch</label>
            <Input
              placeholder="Código de batch..."
              value={filtrosReporte.codBatch}
              onChange={(e) => handleInputChange("codBatch", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Evento</label>
            <Input
              placeholder="Tipo de evento..."
              value={filtrosReporte.tipoEvento}
              onChange={(e) => handleInputChange("tipoEvento", e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={handleGenerarReporte} className="bg-primary hover:bg-primary/90">
            Generar Reporte PDF
          </Button>
          <Button variant="outline" onClick={handleLimpiarFiltros}>
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Área para mostrar el PDF */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Button icon="file-text" variant="ghost" size="sm" />
          <h3 className="text-lg font-semibold">Vista Previa del Reporte</h3>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📄</div>
            <div className="text-lg font-medium text-gray-600">Reporte no generado</div>
            <div className="text-sm text-gray-500">
              Configura los filtros y haz clic en "Generar Reporte PDF" para ver el documento
            </div>
          </div>
        </div>
        
        {/* Placeholder para cuando se implemente el PDF */}
        {/* <embed 
          src="/path/to/report.pdf" 
          type="application/pdf" 
          width="100%" 
          height="600px"
          className="rounded-lg"
        /> */}
      </div>
    </div>
  );
};

export { ReporteEventos };
