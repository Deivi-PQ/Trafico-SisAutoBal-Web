import React, { useState, useMemo } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export default function TablePaginated({
  headers,
  data,
  acciones = [],
  // Props para paginación del servidor
  serverPagination = false,
  currentPage = 1,
  pageSize = 10,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
  loading = false,
  error = null,
  title = "Tabla de Datos",
  // Props para tamaño/spacing
  size = "md", // xs, sm, md, lg, xl
}) {
  // Estados locales para paginación cliente (cuando serverPagination = false)
  const [localPage, setLocalPage] = useState(1);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  // 🔍 Filtrado (solo para paginación local)
  const filteredData = useMemo(() => {
    if (serverPagination || !search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter((row) =>
      headers.some((h) =>
        String(row[h.key] || "")
          .toLowerCase()
          .includes(lower)
      )
    );
  }, [data, search, headers, serverPagination]);

  // 🔢 Ordenamiento mejorado (solo para paginación local)
  const sortedData = useMemo(() => {
    if (serverPagination || !sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      // Manejar valores nulos o undefined
      if (valA == null && valB == null) return 0;
      if (valA == null) return sortAsc ? 1 : -1;
      if (valB == null) return sortAsc ? -1 : 1;

      // Convertir a string para comparación
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();

      // Intentar conversión numérica
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortAsc ? numA - numB : numB - numA;
      }

      // Intentar conversión de fecha
      const dateA = new Date(valA);
      const dateB = new Date(valB);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return sortAsc ? dateA - dateB : dateB - dateA;
      }

      // Comparación de texto
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortAsc, serverPagination]);

  // Usar paginación del servidor o local según el prop
  const page = serverPagination ? currentPage : localPage;
  const rowsPerPage = serverPagination ? pageSize : localRowsPerPage;

  // Calcular total de páginas de forma robusta:
  // - Si el servidor devuelve `totalRecords`, usarlo.
  // - Si no devuelve total pero la página está completa (data.length === pageSize),
  //   inferimos que puede existir una página adicional y permitimos avanzar.
  let computedTotalPages;
  if (serverPagination) {
    const total = Number(totalRecords);
    const ps = Number(pageSize) || 0;
    if (total && total > 0 && ps > 0) {
      computedTotalPages = Math.ceil(total / ps);
    } else if (ps > 0) {
      // Sin total proporcionado: si la página actual viene completa, asumir al menos otra página
      computedTotalPages = data.length === ps ? page + 1 : 1;
    } else {
      computedTotalPages = 1;
    }
  } else {
    computedTotalPages = Math.ceil(sortedData.length / localRowsPerPage);
  }

  const totalPages = computedTotalPages > 0 ? computedTotalPages : 1;

  // 📄 Paginación
  const paginatedData = useMemo(() => {
    if (serverPagination) {
      return data; // Los datos ya vienen paginados del servidor
    }
    const start = (localPage - 1) * localRowsPerPage;
    return sortedData.slice(start, start + localRowsPerPage);
  }, [serverPagination, data, sortedData, localPage, localRowsPerPage]);

  const handleSort = (col) => {
    if (serverPagination) {
      // En paginación del servidor, el sorting se maneja externamente
      return;
    }

    if (sortColumn === col) {
      if (sortAsc) {
        // Primera vez: ASC -> DESC
        setSortAsc(false);
      } else {
        // Segunda vez: DESC -> Sin ordenamiento
        setSortColumn(null);
        setSortAsc(true);
      }
    } else {
      // Nueva columna: establecer ASC
      setSortColumn(col);
      setSortAsc(true);
    }
  };

  const handleRowsChange = (value) => {
    const newPageSize = Number(value);
    if (serverPagination) {
      onPageSizeChange?.(newPageSize);
    } else {
      setLocalRowsPerPage(newPageSize);
      setLocalPage(1);
    }
  };

  const handlePageNavigation = (newPage) => {
    if (serverPagination) {
      onPageChange?.(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  // 📏 Configuración de tamaños
  const getSizeClasses = (size) => {
    const sizeConfig = {
      xs: {
        cellPadding: "p-1",
        textSize: "text-xs",
        maxHeight: "max-h-[240px]", // ~4 filas
        buttonSize: "h-6 w-6",
        headerPadding: "p-1",
      },
      sm: {
        cellPadding: "p-2",
        textSize: "text-xs",
        maxHeight: "max-h-[280px]", // ~4.5 filas
        buttonSize: "h-7 w-7",
        headerPadding: "p-2",
      },
      md: {
        cellPadding: "p-3",
        textSize: "text-sm",
        maxHeight: "max-h-[320px]", // ~5 filas
        buttonSize: "h-8 w-8",
        headerPadding: "p-3",
      },
      lg: {
        cellPadding: "p-4",
        textSize: "text-sm",
        maxHeight: "max-h-[400px]", // ~6 filas
        buttonSize: "h-9 w-9",
        headerPadding: "p-4",
      },
      xl: {
        cellPadding: "p-5",
        textSize: "text-base",
        maxHeight: "max-h-[480px]", // ~7 filas
        buttonSize: "h-10 w-10",
        headerPadding: "p-5",
      },
    };
    return sizeConfig[size] || sizeConfig.md;
  };

  const sizeClasses = getSizeClasses(size);

  return (
    <Card className="p-4">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
        <h2 className="font-semibold text-lg">{title}</h2>

        {!serverPagination && (
          <div className="flex items-center gap-2">
            <span className={`${sizeClasses.textSize} text-gray-500`}>
              Buscar:
            </span>
            <Input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setLocalPage(1);
              }}
              className="w-[200px]"
            />
          </div>
        )}
      </div>

      {/* TABLA */}
      <CardContent className="p-0 overflow-hidden">
        <div className={`${sizeClasses.maxHeight} overflow-auto`}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 text-left select-none">
                {headers.map((h, i) => (
                  <th
                    key={i}
                    onClick={() => !serverPagination && handleSort(h.key)}
                    className={`${sizeClasses.headerPadding} border-b ${
                      sizeClasses.textSize
                    } font-semibold transition-all duration-200 group ${
                      !serverPagination ? "cursor-pointer" : "cursor-default"
                    } ${
                      !serverPagination && sortColumn === h.key
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{h.label}</span>
                      {!serverPagination && (
                        <div className="flex flex-col ml-2">
                          {sortColumn === h.key ? (
                            sortAsc ? (
                              <ChevronUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-blue-600" />
                            )
                          ) : (
                            <ChevronsUpDown
                              className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors`}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {acciones.length > 0 && (
                  <th
                    className={`${sizeClasses.headerPadding} border-b ${sizeClasses.textSize} font-semibold text-center text-gray-700 bg-gray-50`}
                  >
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={headers.length + (acciones.length > 0 ? 1 : 0)}
                    className={`${sizeClasses.cellPadding} text-center text-gray-500`}
                  >
                    <div className="animate-pulse">Cargando datos...</div>
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td
                    colSpan={headers.length + (acciones.length > 0 ? 1 : 0)}
                    className={sizeClasses.cellPadding}
                  >
                    <div
                      className={`bg-red-50 border-l-4 border-red-500 text-red-700 ${sizeClasses.cellPadding}`}
                    >
                      <p className="font-medium">Error al cargar los datos</p>
                      <p className={sizeClasses.textSize}>{error}</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={headers.length + (acciones.length > 0 ? 1 : 0)}
                    className={`${sizeClasses.cellPadding} text-center text-gray-500`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">📋</div>
                      <p className="font-medium">No hay datos para mostrar</p>
                      {search && (
                        <p className={sizeClasses.textSize}>
                          No se encontraron resultados para "{search}"
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                paginatedData.length > 0 &&
                paginatedData.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                  >
                    {headers.map((h, j) => (
                      <td
                        key={j}
                        className={`${sizeClasses.cellPadding} ${sizeClasses.textSize} text-gray-800`}
                      >
                        {row[h.key]}
                      </td>
                    ))}

                    {acciones.length > 0 && (
                      <td
                        className={`${sizeClasses.cellPadding} ${sizeClasses.textSize} text-center`}
                      >
                        <div className="flex justify-center gap-1">
                          {acciones.slice(0, 3).map((accion, k) => (
                            <TooltipProvider key={k}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size={sizeClasses.buttonSize}
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    onClick={() => accion.onClick(row)}
                                  >
                                    {accion.icon}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{accion.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* FOOTER */}
      {!loading && !error && (
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-2">
            <span className={`${sizeClasses.textSize} text-gray-500`}>
              Filas por página:
            </span>
            <Select onValueChange={handleRowsChange}>
              <SelectTrigger className="w-[90px]">
                <SelectValue placeholder={rowsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className={`${sizeClasses.textSize} text-gray-500`}>
            Página {currentPage} de {totalPages} - Mostrando {data.length}{" "}
            registros
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size={sizeClasses.buttonSize}
              disabled={page <= 1}
              onClick={() => handlePageNavigation(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size={sizeClasses.buttonSize}
              disabled={page >= totalPages}
              onClick={() => handlePageNavigation(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
