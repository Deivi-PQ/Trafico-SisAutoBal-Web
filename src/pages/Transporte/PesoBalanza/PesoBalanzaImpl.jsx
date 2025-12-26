import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
import { useToast } from "../../../Components/ui/toast";
import { ListarPesos } from "../../../services/Transporte/PesoBalanza/PesoBalanzaService";
import TablePaginated from "../../../Components/ui/table-paginated";
import { Search } from "lucide-react";
import { FileText } from "lucide-react";
import {
  generateFileNameWithTimestamp,
  downloadFromBase64,
} from "../../../utils/downloadUtils";
import { GenerarReporte } from "../../../services/Transporte/PesoBalanza/PesoBalanzaService";

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PesoBalanza = () => {
  const [pesos, setPesos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const today = getTodayString();
  const [search, setSearch] = useState({
    fecha_Ini: today,
    fecha_Fin: today,
    page_Number: 1,
    page_Size: 10,
  });
  const [currentFilter, setCurrentFilter] = useState({
    IDBalanza: "*",
    ID: "*",
    Nro_Placa: "*",
    fecha_Ini: today,
    fecha_Fin: today,
    page_Number: 1,
    page_Size: 10,
  });
  const refIDBalanza = useRef(null);
  const refID = useRef(null);
  const refNroPlaca = useRef(null);
  const refFechaIni = useRef(null);
  const refFechaFin = useRef(null);
  const addToast = useToast();

  const cargarPesos = useCallback(
    async (filtro) => {
      if (!cargarPesos.lastFetchKey) {
        cargarPesos.lastFetchKey = null;
        cargarPesos.lastFetchTime = 0;
      }
      const key = JSON.stringify(filtro || {});
      const now = Date.now();
      if (
        cargarPesos.lastFetchKey === key &&
        now - cargarPesos.lastFetchTime < 1000
      )
        return;
      cargarPesos.lastFetchKey = key;
      cargarPesos.lastFetchTime = now;

      setLoading(true);
      try {
        const data = await ListarPesos(filtro || {});
        // Normalizar posible estructura de respuesta
        if (!data) {
          setPesos([]);
          setTotalRecords(0);
        } else if (Array.isArray(data)) {
          setPesos(data || []);
          // Si el servidor incluye totalRows en el primer elemento
          const total =
            data.length > 0 && data[0].totalRows != null
              ? Number(data[0].totalRows)
              : data.length;
          setTotalRecords(total);
        } else if (data.items && Array.isArray(data.items)) {
          setPesos(data.items);
          setTotalRecords(
            Number(data.totalRows || data.totalRecords || data.total || 0)
          );
        } else {
          // Objeto sencillo con lista en 'data' o similar
          const maybeItems = data.data || data.items || data.rows;
          if (Array.isArray(maybeItems)) {
            setPesos(maybeItems);
            setTotalRecords(Number(data.totalRows || data.totalRecords || 0));
          } else {
            // Fallback: tratar como array único
            setPesos(Array.isArray(data) ? data : []);
            setTotalRecords(Array.isArray(data) ? data.length : 0);
          }
        }
      } catch (e) {
        console.error("Error al listar pesos", e);
        setPesos([]);
        setTotalRecords(0);
        if (addToast) addToast("Error al listar pesos", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    const today = getTodayString();
    const defaults = {
      IDBalanza: "*",
      ID: "*",
      Nro_Placa: "*",
      fecha_Ini: today,
      fecha_Fin: today,
      page_Number: 1,
      page_Size: 10,
    };
    setCurrentFilter(defaults);
    cargarPesos(defaults);
  }, [cargarPesos]);

  const handleBuscar = () => {
    const idB = refIDBalanza.current?.value || "*";
    const id = refID.current?.value || "*";
    const placa = refNroPlaca.current?.value || "*";
    const fi = refFechaIni.current?.value || getTodayString();
    const ff = refFechaFin.current?.value || getTodayString();
    const filtro = {
      IDBalanza: idB,
      ID: id,
      Nro_Placa: placa,
      fecha_Ini: fi,
      fecha_Fin: ff,
      page_Number: 1,
      page_Size: search.page_Size || 10,
    };
    setCurrentFilter(filtro);
    setSearch((s) => ({ ...s, page_Number: 1, page_Size: filtro.page_Size }));
    cargarPesos(filtro);
  };

  const handleLimpiar = () => {
    const today = getTodayString();
    if (refIDBalanza.current) refIDBalanza.current.value = "";
    if (refID.current) refID.current.value = "";
    if (refNroPlaca.current) refNroPlaca.current.value = "";
    if (refFechaIni.current) refFechaIni.current.value = today;
    if (refFechaFin.current) refFechaFin.current.value = today;
    const defaults = {
      IDBalanza: "*",
      ID: "*",
      Nro_Placa: "*",
      fecha_Ini: today,
      fecha_Fin: today,
      page_Number: 1,
      page_Size: 10,
    };
    setPesos([]);
    setCurrentFilter(defaults);
    setSearch({
      fecha_Ini: today,
      fecha_Fin: today,
      page_Number: 1,
      page_Size: 10,
    });
    cargarPesos(defaults);
  };
  const handlePageChange = (page) => {
    const newFiltros = {
      ...currentFilter,
      page_Number: page,
    };
    setCurrentFilter(newFiltros);
    setSearch((s) => ({ ...s, page_Number: page }));
    cargarPesos(newFiltros);
  };
  const handleRowsPerPageChange = (rowsPerPage) => {
    const newFiltros = {
      ...currentFilter,
      page_Size: rowsPerPage,
      page_Number: 1,
    };
    setCurrentFilter(newFiltros);
    setSearch((s) => ({ ...s, page_Number: 1, page_Size: rowsPerPage }));
    cargarPesos(newFiltros);
  };
  // Función para generar y descargar PDF usando la API
  const handleDescargarPDF = async (reporte) => {
    try {
      // Extraer fecha y turno del reporte (usar valores originales)
      const cod_Batch = reporte.cod_Batch;
      const tipoArchivo = "PDF"; // Tipo de archivo por defecto

      // Llamar al UseCase para generar el reporte
      console.log("Generando reporte PDF para cod_Batch:", cod_Batch);
      const response = await GenerarReporte(tipoArchivo, cod_Batch);

      if (response.file) {
        // Generar nombre del archivo con timestamp
        const defaultFileName = generateFileNameWithTimestamp(
          `Actividad_Turno_PSP_${cod_Batch}`,
          "pdf"
        );

        // Usar el módulo utilitario para manejar la descarga
        downloadFromBase64(response.file, "application/pdf", defaultFileName);
      } else {
        throw new Error("No se recibió respuesta del servidor");
      }
    } catch (error) {
      console.error("Error al generar reporte PDF:", error);
      alert(
        "Error al generar el reporte PDF: " +
          (error.message || "Error desconocido")
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FullScreenLoading isVisible={loading} message="Cargando..." />
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button icon="filter" variant="ghost" size="sm" />
            <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                ID Balanza
              </label>
              <Input
                ref={refIDBalanza}
                name="IDBalanza"
                placeholder="ID Balanza"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">ID</label>
              <Input ref={refID} name="ID" placeholder="ID" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nro Placa
              </label>
              <Input
                ref={refNroPlaca}
                name="Nro_Placa"
                placeholder="Nro Placa"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fecha Inicio
              </label>
              <input
                ref={refFechaIni}
                name="fecha_Ini"
                defaultValue={search.fecha_Ini}
                type="date"
                className="flex h-9 w-full rounded-md border px-3"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fecha Fin
              </label>
              <input
                ref={refFechaFin}
                name="fecha_Fin"
                defaultValue={search.fecha_Fin}
                type="date"
                className="flex h-9 w-full rounded-md border px-3"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleBuscar}>🔍 Buscar</Button>
            <Button variant="outline" onClick={handleLimpiar}>
              🗑️ Limpiar
            </Button>
          </div>
        </div>
      </div>
      {/* Tabla con paginación del servidor */}
      <TablePaginated
        size="sm"
        title="Actividad de Pesaje en Balanza"
        headers={[
          { label: "ID Pesaje", key: "idPesaje" },
          { label: "Tipo Movimiento", key: "tipo_Mov" },
          { label: "Nro Placa", key: "nro_Placa" },
          { label: "Balanza", key: "iDBalanza" },
          { label: "Peso", key: "peso" },
          { label: "Fecha Hora", key: "fechaHora" },
          { label: "Estado", key: "status" },
          { label: "Tipo Vehículo", key: "tipo_Unidad" },
        ]}
        data={pesos}
        acciones={[
          {
            icon: <FileText className="w-4 h-4" />,
            label: "Descargar PDF",
            onClick: (P) => handleDescargarPDF(P),
          },
        ]}
        // Props para paginación del servidor
        serverPagination={true}
        currentPage={currentFilter.page_Number}
        pageSize={currentFilter.page_Size}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
        onPageSizeChange={handleRowsPerPageChange}
        loading={loading}
        error={""}
      />
    </div>
  );
};

export { PesoBalanza };
export default PesoBalanza;
