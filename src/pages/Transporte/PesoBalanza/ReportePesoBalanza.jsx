import React, { useState, useEffect } from "react";
import { Button } from "../../../Components/ui/button";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
import { useToast } from "../../../Components/ui/toast";
import {
  FiltrarPesoBalanza,
  GenerarReporte,
} from "../../../services/Transporte/PesoBalanza/PesoBalanzaService";

const ReportePesoBalanza = () => {
  //
  const [filtrosReporte, setFiltrosReporte] = useState({
    fechaHora_Ini: new Date().toISOString().slice(0, 10),
    fechaHora_Fin: new Date().toISOString().slice(0, 10),
    Nro_Placa: "",
  });

  const [pdfData, setPdfData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [batchOptions, setBatchOptions] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const addToast = useToast();

  const ListaBacth = React.useCallback(async () => {
    try {
      const result = await FiltrarPesoBalanza(
        filtrosReporte.fecha_Ini,
        filtrosReporte.fecha_Fin,
        "*"
      );
      setBatchOptions(result);
    } catch (error) {
      console.error("Error al obtener los batches:", error);
    }
  }, [filtrosReporte.fecha_Ini, filtrosReporte.fecha_Fin]);

  // Actualizar batchOptions automáticamente cuando cambian las fechas
  useEffect(() => {
    ListaBacth();
  }, [ListaBacth]);

  // Limpiar el blob URL cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleInputChange = (field, value) => {
    setFiltrosReporte((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationError) {
      setValidationError(null);
    }
  };

  // Función para validar los filtros antes de generar reportes
  const validateFilters = () => {
    // Validar campo obligatorio: Código Batch
    if (!filtrosReporte.cod_Batch || filtrosReporte.cod_Batch.trim() === "") {
      setValidationError(
        "El código de batch es obligatorio para generar reportes"
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleGenerarReporte = async () => {
    setLoadingReporte(true);
    setIsGenerating(true);
    try {
      const Nro_Placa = filtrosReporte.Nro_Placa;
      const fecha_Ini = filtrosReporte.fechaHora_Ini;
      const fecha_Fin = filtrosReporte.fechaHora_Fin;
      if (!Nro_Placa || Nro_Placa.trim() === "") {
        setValidationError(
          "El código de batch es obligatorio para generar reportes"
        );
        setIsGenerating(false);
        return;
      }
      const response = await GenerarReporte(
        fecha_Ini,
        fecha_Fin,
        Nro_Placa,
        "pdf"
      );
      // La respuesta contiene el archivo en base64
      if (response && response.file) {
        setPdfData(response.file);

        // Crear un blob URL desde el base64
        const binaryString = atob(response.file);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setLoadingReporte(false);
      }
    } catch (error) {
      console.error("Error al generar reporte:", error);
      try {
        addToast("Error al generar el reporte", "error");
      } catch {
        alert("Error al generar el reporte");
      }
      setLoadingReporte(false);
    } finally {
      setIsGenerating(false);
      setLoadingReporte(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltrosReporte({
      fechaHora_Ini: new Date().toISOString().slice(0, 10),
      fechaHora_Fin: new Date().toISOString().slice(0, 10),
      cod_Batch: "",
    });
    // Limpiar el PDF y liberar el blob URL
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfData(null);
    setPdfUrl(null);
    // Limpiar errores de validación
    setValidationError(null);
  };

  const handleDescargarPDF = () => {
    if (pdfData) {
      // Crear el archivo desde base64 y descargarlo
      const binaryString = atob(pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-eventos-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDescargarExcel = async () => {
    // Validar filtros antes de generar
    if (!validateFilters()) {
      return;
    }

    setIsGeneratingExcel(true);
    try {
      const Cod_Batch = filtrosReporte.cod_Batch;
      if (!Cod_Batch || Cod_Batch.trim() === "") {
        setValidationError(
          "El código de batch es obligatorio para generar reportes"
        );
        setIsGenerating(false);
        return;
      }
      const response = await GenerarReporte(Cod_Batch, "excel");
      // La respuesta contiene el archivo Excel en base64
      if (response && response.file) {
        // Crear el archivo desde base64 y descargarlo
        const binaryString = atob(response.file);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte-eventos-${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("Archivo Excel descargado exitosamente");
      }
    } catch (error) {
      console.error("Error al generar reporte Excel:", error);
      try {
        addToast("Error al generar el reporte Excel", "error");
      } catch {
        alert("Error al generar el reporte Excel");
      }
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  return (
    <div className="space-y-6">
      <FullScreenLoading isVisible={loadingReporte} message="Cargando..." />
      {/* Filtros para el reporte */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button icon="filter" variant="ghost" size="sm" />
            <h3 className="text-lg font-semibold">Filtros para Reporte</h3>
          </div>
        </div>

        {validationError && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-4">
            <p className="font-medium">Error de validación</p>
            <p className="text-sm">{validationError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={filtrosReporte.fechaHora_Ini}
              className="border border-blue-200 rounded-lg px-3 py-2 text-sm w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              onChange={(e) =>
                handleInputChange("fechaHora_Ini", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold mb-1">Fecha Fin</label>
            <input
              type="date"
              value={filtrosReporte.fechaHora_Fin}
              className="border border-blue-200 rounded-lg px-3 py-2 text-sm w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              onChange={(e) =>
                handleInputChange("fechaHora_Fin", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold mb-1">
              Código Batch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="border border-blue-200 rounded-lg px-3 py-2 text-sm w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Buscar o escribir batch"
              value={filtrosReporte.cod_Batch}
              onChange={(e) => handleInputChange("cod_Batch", e.target.value)}
              autoComplete="off"
              onFocus={() => setShowBatchDropdown(true)}
              onBlur={() => setTimeout(() => setShowBatchDropdown(false), 150)}
            />
            {showBatchDropdown && (
              <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg mt-1 w-48 max-h-40 overflow-y-auto shadow-lg">
                {batchOptions.filter(
                  (opt) =>
                    typeof opt.cod_Batch === "string" &&
                    opt.cod_Batch
                      .toLowerCase()
                      .includes(filtrosReporte.cod_Batch.toLowerCase())
                ).length > 0 ? (
                  batchOptions
                    .filter(
                      (opt) =>
                        typeof opt.cod_Batch === "string" &&
                        opt.cod_Batch
                          .toLowerCase()
                          .includes(filtrosReporte.cod_Batch.toLowerCase())
                    )
                    .map((opt) => (
                      <li
                        key={opt.cod_Batch}
                        className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
                        onMouseDown={() =>
                          handleInputChange("cod_Batch", opt.cod_Batch)
                        }
                      >
                        {opt.cod_Batch}
                      </li>
                    ))
                ) : (
                  <li className="px-3 py-2 text-gray-400 text-sm">
                    Sin coincidencias
                  </li>
                )}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">Campo obligatorio</p>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleGenerarReporte}
            className="bg-primary hover:bg-primary/90"
            disabled={isGenerating || isGeneratingExcel}
            icon="file-text"
          >
            {isGenerating ? "Generando PDF..." : "Generar Reporte PDF"}
          </Button>
          <Button
            onClick={handleDescargarExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isGenerating || isGeneratingExcel}
            icon="download"
          >
            {isGeneratingExcel ? "Generando Excel..." : "Descargar Excel"}
          </Button>
          <Button variant="outline" onClick={handleLimpiarFiltros} icon="x">
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Área para mostrar el PDF */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button icon="file-text" variant="ghost" size="sm" />
            <h3 className="text-lg font-semibold">Vista Previa del Reporte</h3>
          </div>
          {pdfUrl && (
            <div className="flex gap-2">
              <Button
                onClick={handleDescargarPDF}
                variant="outline"
                size="sm"
                icon="download"
              >
                Descargar PDF
              </Button>
            </div>
          )}
        </div>

        {pdfUrl ? (
          <div
            className="border rounded-lg overflow-hidden"
            style={{ height: "600px" }}
          >
            <embed
              src={pdfUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              className="rounded-lg"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl text-gray-400">📄</div>
              <div className="text-lg font-medium text-gray-600">
                Reporte no generado
              </div>
              <div className="text-sm text-gray-500 max-w-md mx-auto">
                Configura los filtros de fecha, batch y otros criterios, luego
                haz clic en "Generar Reporte PDF" para visualizar el documento
              </div>
              <div className="text-xs text-gray-400">
                El reporte incluirá todos los eventos de disponibilidad que
                coincidan con los filtros especificados
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ReportePesoBalanza };
export default ReportePesoBalanza;
