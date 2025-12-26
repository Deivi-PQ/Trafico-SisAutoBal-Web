import React, { useState, useEffect, useRef, useCallback } from "react";
import LargeModal from "../../../Components/BaseModal/LargeModel";
import {
  ListarVehiculo,
  RecuperarVehiculo,
  GrabarVehiculo,
  EliminarVehiculo,
} from "../../../services/Global/Vehiculo/VehiculoService";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { ComboBox } from "../../../Components/ui/combobox";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
import { useToast } from "../../../Components/ui/toast";

const Vehiculo = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const showErrorToast = (message) => {
    showToast(message, "error");
  };
  const showSuccessToast = (message) => {
    showToast(message, "success");
  };

  const [modalForm, setModalForm] = useState({
    Nro_Placa: "",
    IDProveedor: "",
    Cod_Interno: "",
    Marca: "",
    Modelo: "",
    Nro_Certif_Inscripcion: "",
    Año: "",
    Nro_Ejes: "",
    Estado: "A",
    Largo: "",
    Ancho: "",
    Alto: "",
    Conf_Vehicular: "",
    Peso: "",
    Tipo_Unidad: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState({
    Nro_Placa: "*",
    IDProveedor: "*",
    Año: 0,
    Nro_Ejes: 0,
    Estado: "*",
    Tipo_Unidad: "*",
  });
  const isFirstSearch = useRef(true);

  const currentYear = new Date().getFullYear();
  const yearOptionsModal = [];
  for (let y = currentYear; y >= 1990; y--) {
    yearOptionsModal.push({ value: y, label: String(y) });
  }
  yearOptionsModal.unshift({ value: "", label: "-- Seleccionar --" });

  const yearOptionsFilter = [{ value: 0, label: "-- Todos --" }];
  for (let y = currentYear; y >= 1990; y--) {
    yearOptionsFilter.push({ value: y, label: String(y) });
  }

  const ejesOptionsFilter = [
    { value: 0, label: "-- Todos --" },
    {
      value: 2,
      label: "2 ejes",
    },
    {
      value: 3,
      label: "3 ejes",
    },
    { value: 4, label: "4 ejes" },
    { value: 5, label: "5 ejes" },
    { value: 6, label: "6 ejes" },
    { value: 7, label: "7 ejes" },
    { value: 8, label: "8 ejes" },
    {
      value: 9,
      label: "9 ejes",
    },
  ];

  const ejesOptionsModal = [
    { value: "", label: "-- Seleccionar --" },
    ...ejesOptionsFilter
      .slice(1)
      .map((o) => ({ value: o.value, label: o.label })),
  ];

  const cargarVehiculos = useCallback(async (filtro) => {
    if (!cargarVehiculos.lastFetchKey) {
      cargarVehiculos.lastFetchKey = null;
      cargarVehiculos.lastFetchTime = 0;
    }
    const key = JSON.stringify(filtro || {});
    const now = Date.now();
    if (
      cargarVehiculos.lastFetchKey === key &&
      now - cargarVehiculos.lastFetchTime < 1000
    ) {
      return;
    }
    cargarVehiculos.lastFetchKey = key;
    cargarVehiculos.lastFetchTime = now;

    setLoading(true);
    try {
      const data = await ListarVehiculo(filtro || {});
      setVehiculos(data || []);
    } catch (e) {
      console.error("Error al listar vehículos", e);
      setVehiculos([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarVehiculos({
      Nro_Placa: "*",
      IDProveedor: "*",
      Año: 0,
      Nro_Ejes: 0,
      Estado: "*",
      Tipo_Unidad: "*",
    });
  }, [cargarVehiculos]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "Nro_Placa") {
      newValue = String(value).replace(/\D/g, "");
    }
    setSearch((prev) => ({ ...prev, [name]: newValue }));
  };

  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      const filtro = {
        Nro_Placa: search.Nro_Placa || "*",
        IDProveedor: search.IDProveedor || "*",
        Año:
          search.Año !== "" && search.Año !== null && search.Año !== undefined
            ? search.Año
            : "*",
        Nro_Ejes:
          search.Nro_Ejes !== "" &&
          search.Nro_Ejes !== null &&
          search.Nro_Ejes !== undefined
            ? search.Nro_Ejes
            : "*",
        Estado: search.Estado || "*",
        Tipo_Unidad: search.Tipo_Unidad || "*",
      };
      cargarVehiculos(filtro);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, cargarVehiculos]);

  const validateForm = (f) => {
    const errors = {};
    if (!f.Nro_Placa) errors.Nro_Placa = "Número de Placa es obligatorio.";
    else if (!/^\d+$/.test(f.Nro_Placa))
      errors.Nro_Placa = "Número de Placa debe contener sólo dígitos.";
    if (!f.IDProveedor) errors.IDProveedor = "ID Proveedor es obligatorio.";
    if (!f.Marca) errors.Marca = "Marca es obligatoria.";
    if (!f.Modelo) errors.Modelo = "Modelo es obligatorio.";
    if (!f.Año) errors.Año = "Año es obligatorio.";
    else if (!/^\d{4}$/.test(f.Año))
      errors.Año = "Año debe ser un valor de 4 dígitos.";
    if (!f.Nro_Ejes) errors.Nro_Ejes = "Número de Ejes es obligatorio.";
    return errors;
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "Nro_Placa") {
      newValue = String(value).replace(/\D/g, "");
    } else if (name === "Año" || name === "Nro_Ejes") {
      newValue = String(value).replace(/\D/g, "");
    } else if (
      name === "Largo" ||
      name === "Ancho" ||
      name === "Alto" ||
      name === "Peso"
    ) {
      // Allow decimal numbers
      newValue = String(value).replace(/[^\d.]/g, "");
    }
    setModalForm((prev) => ({ ...prev, [name]: newValue }));
    setFormErrors((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const handleCreate = () => {
    setModalMode("create");
    setModalForm({
      Nro_Placa: "",
      IDProveedor: "",
      Cod_Interno: "",
      Marca: "",
      Modelo: "",
      Nro_Certif_Inscripcion: "",
      Año: "",
      Nro_Ejes: "",
      Estado: "A",
      Largo: "",
      Ancho: "",
      Alto: "",
      Conf_Vehicular: "",
      Peso: "",
      Tipo_Unidad: "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = async (vehiculo) => {
    try {
      const id = vehiculo?.Nro_Placa ?? vehiculo?.nro_Placa ?? "";
      const dataRaw = id ? await RecuperarVehiculo(id) : vehiculo || {};
      const data = {
        Nro_Placa: dataRaw.Nro_Placa ?? dataRaw.nro_Placa ?? "",
        IDProveedor: dataRaw.IDProveedor ?? dataRaw.idProveedor ?? "",
        Cod_Interno: dataRaw.Cod_Interno ?? dataRaw.cod_Interno ?? "",
        Marca: dataRaw.Marca ?? dataRaw.marca ?? "",
        Modelo: dataRaw.Modelo ?? dataRaw.modelo ?? "",
        Nro_Certif_Inscripcion:
          dataRaw.Nro_Certif_Inscripcion ??
          dataRaw.nro_Certif_Inscripcion ??
          "",
        Año: dataRaw.Año ?? dataRaw.año ?? "",
        Nro_Ejes: dataRaw.Nro_Ejes ?? dataRaw.nro_Ejes ?? "",
        Estado: dataRaw.Estado ?? dataRaw.estado ?? "A",
        Largo: dataRaw.Largo ?? dataRaw.largo ?? "",
        Ancho: dataRaw.Ancho ?? dataRaw.ancho ?? "",
        Alto: dataRaw.Alto ?? dataRaw.alto ?? "",
        Conf_Vehicular: dataRaw.Conf_Vehicular ?? dataRaw.conf_Vehicular ?? "",
        Peso: dataRaw.Peso ?? dataRaw.peso ?? "",
        Tipo_Unidad: dataRaw.Tipo_Unidad ?? dataRaw.tipo_Unidad ?? "",
      };
      setModalMode("edit");
      setModalForm(data);
      setFormErrors({});
      setModalOpen(true);
    } catch (e) {
      console.error("Error al recuperar vehículo", e);
      alert("Error al recuperar vehículo.");
    }
  };

  const handleDelete = async (Nro_Placa) => {
    if (!window.confirm("¿Seguro que deseas eliminar este vehículo?")) return;
    setLoading(true);
    try {
      const resp = await EliminarVehiculo(Nro_Placa);
      if (resp) {
        showSuccessToast("Vehículo eliminado correctamente.");
        cargarVehiculos({
          Nro_Placa: "*",
          IDProveedor: "*",
          Año: 0,
          Nro_Ejes: 0,
          Estado: "*",
          Tipo_Unidad: "*",
        });
      } else {
        showErrorToast("Error al eliminar vehículo.");
      }
    } catch (e) {
      console.error(e);
      showErrorToast("Error al eliminar vehículo.");
    }
    setLoading(false);
  };

  const handleModalSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const errors = validateForm(modalForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }
    try {
      const oVehiculo = {
        Nro_Placa: modalForm.Nro_Placa,
        IDProveedor: modalForm.IDProveedor,
        Cod_Interno: modalForm.Cod_Interno,
        Marca: modalForm.Marca,
        Modelo: modalForm.Modelo,
        Nro_Certif_Inscripcion: modalForm.Nro_Certif_Inscripcion,
        Año: Number(modalForm.Año) || 0,
        Nro_Ejes: Number(modalForm.Nro_Ejes) || 0,
        Estado: modalForm.Estado,
        Largo: Number(modalForm.Largo) || 0,
        Ancho: Number(modalForm.Ancho) || 0,
        Alto: Number(modalForm.Alto) || 0,
        Conf_Vehicular: modalForm.Conf_Vehicular,
        Peso: Number(modalForm.Peso) || 0,
        Tipo_Unidad: modalForm.Tipo_Unidad,
      };
      const resp = await GrabarVehiculo(oVehiculo);
      if (resp) {
        showSuccessToast("Vehículo guardado correctamente.");
        cargarVehiculos({
          ...search,
          Nro_Placa: search.Nro_Placa || "*",
          IDProveedor: search.IDProveedor || "*",
          Año:
            search.Año !== "" && search.Año !== null && search.Año !== undefined
              ? search.Año
              : "*",
          Nro_Ejes:
            search.Nro_Ejes !== "" &&
            search.Nro_Ejes !== null &&
            search.Nro_Ejes !== undefined
              ? search.Nro_Ejes
              : "*",
          Estado: search.Estado || "*",
          Tipo_Unidad: search.Tipo_Unidad || "*",
        });
        setModalOpen(false);
      } else {
        showErrorToast("Error al guardar vehículo.");
      }
    } catch (e) {
      console.error(e);
      showErrorToast(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FullScreenLoading isVisible={loading} message="Cargando..." />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GESTIÓN DE VEHÍCULOS</h1>
            <p className="text-muted-foreground">
              Administra los vehículos del sistema.
            </p>
          </div>
        </div>
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
                Número Placa
              </label>
              <Input
                name="Nro_Placa"
                value={search.Nro_Placa}
                onChange={handleSearchChange}
                placeholder="Ingrese Número Placa"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                ID Proveedor
              </label>
              <Input
                name="IDProveedor"
                value={search.IDProveedor}
                onChange={handleSearchChange}
                placeholder="Ingrese ID Proveedor"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Año</label>
              <ComboBox
                options={yearOptionsFilter}
                value={search.Año}
                onValueChange={(val) =>
                  setSearch((prev) => ({
                    ...prev,
                    Año: val === "" ? 0 : Number(val),
                  }))
                }
                className="input input-bordered w-full rounded-lg border-2 h-10 text-sm px-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Número de Ejes
              </label>
              <ComboBox
                options={ejesOptionsFilter}
                value={search.Nro_Ejes}
                onValueChange={(val) =>
                  setSearch((prev) => ({
                    ...prev,
                    Nro_Ejes: val === "" ? 0 : Number(val),
                  }))
                }
                className="input input-bordered w-full rounded-lg border-2 h-10 text-sm px-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <ComboBox
                options={[
                  { value: "*", label: "-- Todos --" },
                  { value: "A", label: "Activo" },
                  { value: "X", label: "Inactivo" },
                ]}
                value={search.Estado}
                onValueChange={(val) =>
                  setSearch((prev) => ({ ...prev, Estado: val }))
                }
                className="input input-bordered w-full rounded-lg border-2 h-10 text-sm px-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipo Unidad
              </label>
              <ComboBox
                options={[
                  { value: "*", label: "-- Todos --" },
                  { value: "M", label: "Monotren" },
                  { value: "B", label: "Bitren" },
                  { value: "T", label: "Tritren" },
                ]}
                value={search.Tipo_Unidad}
                onValueChange={(val) =>
                  setSearch((prev) => ({ ...prev, Tipo_Unidad: val }))
                }
                className="input input-bordered w-full rounded-lg border-2 h-10 text-sm px-2"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() =>
                cargarVehiculos({
                  Nro_Placa: search.Nro_Placa || "*",
                  IDProveedor: search.IDProveedor || "*",
                  Año:
                    search.Año !== "" &&
                    search.Año !== null &&
                    search.Año !== undefined
                      ? search.Año
                      : "*",
                  Nro_Ejes:
                    search.Nro_Ejes !== "" &&
                    search.Nro_Ejes !== null &&
                    search.Nro_Ejes !== undefined
                      ? search.Nro_Ejes
                      : "*",
                  Estado: search.Estado || "*",
                  Tipo_Unidad: search.Tipo_Unidad || "*",
                })
              }
            >
              🔍 Buscar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearch({
                  Nro_Placa: "*",
                  IDProveedor: "*",
                  Año: 0,
                  Nro_Ejes: 0,
                  Estado: "*",
                  Tipo_Unidad: "*",
                });
                cargarVehiculos({
                  Nro_Placa: "*",
                  IDProveedor: "*",
                  Año: 0,
                  Nro_Ejes: 0,
                  Estado: "*",
                  Tipo_Unidad: "*",
                });
              }}
            >
              🗑️ Limpiar
            </Button>
            <Button icon="plus" variant="default" onClick={handleCreate}>
              Nuevo
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg mt-4">
          {loading ? (
            <div className="p-8 text-center">Cargando vehículos...</div>
          ) : (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  Vehículos ({vehiculos.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Número Placa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        ID Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Marca
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Modelo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Año
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Ejes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Tipo Unidad
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {vehiculos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="text-center py-8 text-gray-500"
                        >
                          No se encontraron Vehículos
                        </td>
                      </tr>
                    ) : (
                      vehiculos.map((vehiculo, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {vehiculo.Nro_Placa ?? vehiculo.nro_Placa}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {vehiculo.IDProveedor ?? vehiculo.idProveedor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {vehiculo.Marca ?? vehiculo.marca}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {vehiculo.Modelo ?? vehiculo.modelo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {vehiculo.Año ?? vehiculo.año}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {vehiculo.Nro_Ejes ?? vehiculo.nro_Ejes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                (vehiculo.Estado ?? vehiculo.estado) === "A"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {(vehiculo.Estado ?? vehiculo.estado) === "A"
                                ? "Activo"
                                : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {(() => {
                              const tipoVal =
                                vehiculo.Tipo_Unidad ??
                                vehiculo.tipo_Unidad ??
                                "";
                              const tipoMap = {
                                M: "Monotren",
                                B: "Bitren",
                                T: "Tritren",
                              };
                              return tipoMap[tipoVal] || tipoVal || "-";
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(vehiculo)}
                              >
                                ✏️ Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete(
                                    vehiculo.Nro_Placa ?? vehiculo.nro_Placa
                                  )
                                }
                              >
                                🗑️ Eliminar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <LargeModal
        show={modalOpen}
        title={modalMode === "create" ? "Nuevo Vehículo" : "Editar Vehículo"}
        onClose={() => setModalOpen(false)}
        className="w-auto h-auto max-w-fit max-h-fit"
      >
        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Número Placa */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Número Placa
              </label>
              <input
                name="Nro_Placa"
                value={modalForm.Nro_Placa}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Nro_Placa ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Ej: 12345"
                disabled={modalMode === "edit"}
              />
              {formErrors.Nro_Placa && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Nro_Placa}
                </label>
              )}
            </div>

            {/* ID Proveedor */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                ID Proveedor
              </label>
              <input
                name="IDProveedor"
                value={modalForm.IDProveedor}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.IDProveedor ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="ID Proveedor"
              />
              {formErrors.IDProveedor && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.IDProveedor}
                </label>
              )}
            </div>

            {/* Código Interno */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Código Interno
              </label>
              <input
                name="Cod_Interno"
                value={modalForm.Cod_Interno}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Código Interno"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="text-sm font-medium mb-2 block">Marca</label>
              <input
                name="Marca"
                value={modalForm.Marca}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Marca ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Marca"
              />
              {formErrors.Marca && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Marca}
                </label>
              )}
            </div>

            {/* Modelo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Modelo</label>
              <input
                name="Modelo"
                value={modalForm.Modelo}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Modelo ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Modelo"
              />
              {formErrors.Modelo && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Modelo}
                </label>
              )}
            </div>

            {/* Año */}
            <div>
              <label className="text-sm font-medium mb-2 block">Año</label>
              <ComboBox
                options={yearOptionsModal}
                value={modalForm.Año}
                onValueChange={(val) =>
                  setModalForm((prev) => ({
                    ...prev,
                    Año: val === "" ? "" : String(val),
                  }))
                }
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Año ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {formErrors.Año && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Año}
                </label>
              )}
            </div>

            {/* Número de Ejes */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Número de Ejes
              </label>
              <ComboBox
                options={ejesOptionsModal}
                value={modalForm.Nro_Ejes}
                onValueChange={(val) =>
                  setModalForm((prev) => ({
                    ...prev,
                    Nro_Ejes: val === "" ? "" : String(val),
                  }))
                }
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Nro_Ejes ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {formErrors.Nro_Ejes && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Nro_Ejes}
                </label>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <ComboBox
                options={[
                  { value: "A", label: "Activo" },
                  { value: "X", label: "Inactivo" },
                ]}
                value={modalForm.Estado}
                onValueChange={(val) =>
                  setModalForm((prev) => ({ ...prev, Estado: val }))
                }
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
              />
            </div>

            {/* Tipo Unidad */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipo Unidad
              </label>
              <ComboBox
                options={[
                  { value: "", label: "-- Seleccionar --" },
                  { value: "M", label: "Monotren" },
                  { value: "B", label: "Bitren" },
                  { value: "T", label: "Tritren" },
                ]}
                value={modalForm.Tipo_Unidad}
                onValueChange={(val) =>
                  setModalForm((prev) => ({ ...prev, Tipo_Unidad: val }))
                }
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
              />
            </div>

            {/* Nro Certif Inscripción */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nro Certif Inscripción
              </label>
              <input
                name="Nro_Certif_Inscripcion"
                value={modalForm.Nro_Certif_Inscripcion}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Nro Certif Inscripción"
              />
            </div>

            {/* Largo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Largo</label>
              <input
                name="Largo"
                type="text"
                value={modalForm.Largo}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Largo (m)"
              />
            </div>

            {/* Ancho */}
            <div>
              <label className="text-sm font-medium mb-2 block">Ancho</label>
              <input
                name="Ancho"
                type="text"
                value={modalForm.Ancho}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Ancho (m)"
              />
            </div>

            {/* Alto */}
            <div>
              <label className="text-sm font-medium mb-2 block">Alto</label>
              <input
                name="Alto"
                type="text"
                value={modalForm.Alto}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Alto (m)"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="text-sm font-medium mb-2 block">Peso</label>
              <input
                name="Peso"
                type="text"
                value={modalForm.Peso}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Peso (kg)"
              />
            </div>

            {/* Configuración Vehicular */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium mb-2 block">
                Configuración Vehicular
              </label>
              <input
                name="Conf_Vehicular"
                value={modalForm.Conf_Vehicular}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Configuración Vehicular"
              />
            </div>

            {/* Observaciones removed per request */}
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="bg-black text-white border-black hover:bg-gray-800"
            >
              {modalMode === "create" ? "Guardar" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </LargeModal>
    </div>
  );
};

export default Vehiculo;
