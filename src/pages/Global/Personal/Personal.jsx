import React, { useState, useEffect, useRef } from "react";
import LargeModal from "../../../Components/BaseModal/LargeModel";
import {
  GrabarPersona,
  EliminarPersona,
  ListarPersona,
  RecuperarPersona,
} from "../../../services/Global/Personal/Persona.js";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
import { useToast } from "../../../Components/ui/toast";

const Personal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const showErrorToast = (message) => {
    showToast(message, "error");
  };
  const showSuccessToast = (message) => {
    showToast(message, "success");
  };

  const [modalForm, setModalForm] = useState({
    IDPersona: "",
    Nombres: "",
    Apellido_Paterno: "",
    Apellido_Materno: "",
    Nro_Doc_Iden: "",
    Direccion: "",
    EMail: "",
    IDProveedor: "",
    Fecha_Nacimiento: "",
    Estado_Civil: "",
    Sexo: "M",
    Fecha_Registro: "",
    RUC: "",
    Fecha_Cese: "",
    Obs_Persona: "",
    Nro_Licencia: "",
    Estado: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState({
    Nombres: "",
    Apellidos: "",
    Estado: "T",
  });
  const isFirstSearch = useRef(true);

  const cargarPersonas = async (filtro) => {
    // Dedupe: evita llamadas idénticas inmediatas
    if (!cargarPersonas.lastFetchKey) {
      cargarPersonas.lastFetchKey = null;
      cargarPersonas.lastFetchTime = 0;
    }
    const key = JSON.stringify(filtro || {});
    const now = Date.now();
    if (
      cargarPersonas.lastFetchKey === key &&
      now - cargarPersonas.lastFetchTime < 1000
    ) {
      return;
    }
    cargarPersonas.lastFetchKey = key;
    cargarPersonas.lastFetchTime = now;

    setLoading(true);
    try {
      const data = await ListarPersona(filtro || {});
      setPersonas(data || []);
    } catch (e) {
      console.error("Error al listar personas", e);
      setPersonas([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarPersonas({ Nombres: "", Apellidos: "", Estado: "T" });
  }, []);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // filtrar cuando cambie search (debounce). Ignorar la primera ejecución
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      const filtro = {
        Nombres: search.Nombres || "",
        Apellidos: search.Apellidos || "",
        Estado: search.Estado,
      };
      cargarPersonas(filtro);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const validateForm = (f) => {
    const errors = {};
    if (!f.IDPersona && f.IDPersona !== "")
      errors.IDPersona = "ID Persona es obligatorio.";
    if (!f.Nombres) errors.Nombres = "Nombres es obligatorio.";
    if (!f.Apellido_Paterno)
      errors.Apellido_Paterno = "Apellido Paterno es obligatorio.";
    if (!f.EMail) errors.EMail = "Email es obligatorio.";
    if (!f.Nro_Doc_Iden)
      errors.Nro_Doc_Iden = "Número de Documento es obligatorio.";
    return errors;
  };

  const handleModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
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
      IDPersona: "",
      Nombres: "",
      Apellido_Paterno: "",
      Apellido_Materno: "",
      Nro_Doc_Iden: "",
      Direccion: "",
      EMail: "",
      IDProveedor: "",
      Fecha_Nacimiento: "",
      Estado_Civil: "",
      Sexo: "M",
      Fecha_Registro: "",
      RUC: "",
      Fecha_Cese: "",
      Obs_Persona: "",
      Nro_Licencia: "",
      Estado: true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = async (persona) => {
    try {
      // Normalizar posible variación en nombres de propiedades
      const id = persona?.IDPersona ?? persona?.idPersona ?? "";
      const dataRaw = id ? await RecuperarPersona(id) : persona || {};
      const data = {
        IDPersona: dataRaw.IDPersona ?? dataRaw.idPersona ?? "",
        Nombres: dataRaw.Nombres ?? dataRaw.nombres ?? "",
        Apellido_Paterno:
          dataRaw.Apellido_Paterno ?? dataRaw.apellido_Paterno ?? "",
        Apellido_Materno:
          dataRaw.Apellido_Materno ?? dataRaw.apellido_Materno ?? "",
        Nro_Doc_Iden: dataRaw.Nro_Doc_Iden ?? dataRaw.nro_Doc_Iden ?? "",
        Direccion: dataRaw.Direccion ?? dataRaw.direccion ?? "",
        EMail: dataRaw.EMail ?? dataRaw.eMail ?? "",
        IDProveedor: dataRaw.IDProveedor ?? dataRaw.idProveedor ?? "",
        Fecha_Nacimiento:
          dataRaw.Fecha_Nacimiento ?? dataRaw.fecha_Nacimiento ?? "",
        Estado_Civil: dataRaw.Estado_Civil ?? dataRaw.estado_Civil ?? "",
        Sexo: dataRaw.Sexo ?? dataRaw.sexo ?? "M",
        Fecha_Registro: dataRaw.Fecha_Registro ?? dataRaw.fecha_Registro ?? "",
        RUC: dataRaw.RUC ?? dataRaw.ruc ?? "",
        Fecha_Cese: dataRaw.Fecha_Cese ?? dataRaw.fecha_Cese ?? "",
        Obs_Persona: dataRaw.Obs_Persona ?? dataRaw.obs_Persona ?? "",
        Nro_Licencia: dataRaw.Nro_Licencia ?? dataRaw.nro_Licencia ?? "",
        Estado: dataRaw.Estado ?? dataRaw.estado ?? true,
      };
      setModalMode("edit");
      setModalForm(data);
      setFormErrors({});
      setModalOpen(true);
    } catch (e) {
      console.error("Error al recuperar persona", e);
      alert("Error al recuperar persona.");
    }
  };

  const handleDelete = async (IDPersona) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta persona?")) return;
    setLoading(true);
    try {
      const resp = await EliminarPersona(IDPersona);
      if (resp) {
        alert("Persona eliminada correctamente.");
        cargarPersonas({ Nombres: "", Apellidos: "", Estado: "T" });
      } else {
        alert("Error al eliminar persona.");
        cargarPersonas({ Nombres: "", Apellidos: "", Estado: "T" });
      }
    } catch (e) {
      console.error(e);
      alert("Error al eliminar persona.");
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
      setModalOpen(false);
      return;
    }
    try {
      const oPersona = { ...modalForm };
      const resp = await GrabarPersona(oPersona);
      if (resp) {
        showSuccessToast("Persona guardada correctamente.");
        cargarPersonas({
          ...search,
          Nombres: search.Nombres || "",
          Apellidos: search.Apellidos || "",
        });
        setModalOpen(false);
        setLoading(false);
      } else {
        showErrorToast("Error al guardar persona.");
        setModalOpen(false);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      showErrorToast(e.message);
      setModalOpen(false);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FullScreenLoading isVisible={loading} message="Cargando..." />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GESTIÓN DE PERSONAS</h1>
            <p className="text-muted-foreground">
              Administra el registro de personas del sistema.
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
              <label className="text-sm font-medium mb-2 block">Nombres</label>
              <Input
                name="Nombres"
                value={search.Nombres}
                onChange={handleSearchChange}
                placeholder="Ingrese Nombres"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Apellidos
              </label>
              <Input
                name="Apellidos"
                value={search.Apellidos}
                onChange={handleSearchChange}
                placeholder="Ingrese Apellidos"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                name="Estado"
                value={search.Estado}
                onChange={handleSearchChange}
                className="flex h-9 w-full rounded-md border px-3"
              >
                <option value="T">Todos</option>
                <option value="A">Activo</option>
                <option value="X">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() =>
                cargarPersonas({
                  Nombres: search.Nombres || "",
                  Apellidos: search.Apellidos || "",
                  Estado: search.Estado,
                })
              }
            >
              🔍 Buscar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearch({ Nombres: "", Apellidos: "", Estado: "T" });
                cargarPersonas({ Nombres: "", Apellidos: "", Estado: "T" });
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
            <div className="p-8 text-center">Cargando personas...</div>
          ) : (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  Personas ({personas.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Nombres
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Apellidos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Nro Documento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {personas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          No se encontraron Personas
                        </td>
                      </tr>
                    ) : (
                      personas.map((p, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.Nombres ?? p.nombres}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {(p.Apellido_Paterno ?? p.apellido_Paterno ?? "") +
                              " " +
                              (p.Apellido_Materno ?? p.apellido_Materno ?? "")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.EMail ?? p.eMail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.Nro_Doc_Iden ?? p.nro_Doc_Iden}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.Estado || p.estado ? "Activo" : "Inactivo"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(p)}
                              >
                                ✏️ Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete(p.IDPersona ?? p.idPersona)
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
        title={modalMode === "create" ? "Crear Persona" : "Editar Persona"}
        onClose={() => setModalOpen(false)}
        className="w-auto h-auto max-w-fit max-h-fit"
      >
        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ID Persona */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                ID Persona
              </label>
              <input
                name="IDPersona"
                value={modalForm.IDPersona}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.IDPersona ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="ID único"
                disabled={modalMode === "edit"}
              />
              {formErrors.IDPersona && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.IDPersona}
                </label>
              )}
            </div>

            {/* Nombres */}
            <div>
              <label className="text-sm font-medium mb-2 block">Nombres</label>
              <input
                name="Nombres"
                value={modalForm.Nombres}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Nombres ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Nombres"
              />
              {formErrors.Nombres && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Nombres}
                </label>
              )}
            </div>

            {/* Apellido Paterno */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Apellido Paterno
              </label>
              <input
                name="Apellido_Paterno"
                value={modalForm.Apellido_Paterno}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Apellido_Paterno ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Apellido Paterno"
              />
              {formErrors.Apellido_Paterno && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Apellido_Paterno}
                </label>
              )}
            </div>

            {/* Apellido Materno */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Apellido Materno
              </label>
              <input
                name="Apellido_Materno"
                value={modalForm.Apellido_Materno}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Apellido Materno"
              />
            </div>

            {/* Nro Doc Iden */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Número Documento
              </label>
              <input
                name="Nro_Doc_Iden"
                value={modalForm.Nro_Doc_Iden}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Nro_Doc_Iden ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Número de Documento"
              />
              {formErrors.Nro_Doc_Iden && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Nro_Doc_Iden}
                </label>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input
                name="EMail"
                type="email"
                value={modalForm.EMail}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.EMail ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Email"
              />
              {formErrors.EMail && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.EMail}
                </label>
              )}
            </div>

            {/* Dirección */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">
                Dirección
              </label>
              <input
                name="Direccion"
                value={modalForm.Direccion}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Dirección"
              />
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
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="ID Proveedor"
              />
            </div>

            {/* Fecha Nacimiento */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fecha Nacimiento
              </label>
              <input
                name="Fecha_Nacimiento"
                type="date"
                value={modalForm.Fecha_Nacimiento}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
              />
            </div>

            {/* Estado Civil */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Estado Civil
              </label>
              <select
                name="Estado_Civil"
                value={modalForm.Estado_Civil}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
              >
                <option value="">Seleccionar</option>
                <option value="Soltero">Soltero</option>
                <option value="Casado">Casado</option>
                <option value="Divorciado">Divorciado</option>
                <option value="Viudo">Viudo</option>
              </select>
            </div>

            {/* Sexo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sexo</label>
              <select
                name="Sexo"
                value={modalForm.Sexo}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            {/* Fecha Registro */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fecha Registro
              </label>
              <input
                name="Fecha_Registro"
                type="datetime-local"
                value={modalForm.Fecha_Registro}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
              />
            </div>

            {/* RUC */}
            <div>
              <label className="text-sm font-medium mb-2 block">RUC</label>
              <input
                name="RUC"
                value={modalForm.RUC}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="RUC"
              />
            </div>

            {/* Fecha Cese */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fecha Cese
              </label>
              <input
                name="Fecha_Cese"
                type="date"
                value={modalForm.Fecha_Cese}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
              />
            </div>

            {/* Nro Licencia */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nro Licencia
              </label>
              <input
                name="Nro_Licencia"
                value={modalForm.Nro_Licencia}
                onChange={handleModalChange}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2"
                placeholder="Nro Licencia"
              />
            </div>

            {/* Estado Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Estado</label>
              <input
                name="Estado"
                type="checkbox"
                checked={modalForm.Estado}
                onChange={handleModalChange}
                className="w-4 h-4"
              />
              <span className="text-sm">
                {modalForm.Estado ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* Observaciones */}
            <div className="lg:col-span-3">
              <label className="text-sm font-medium mb-2 block">
                Observaciones
              </label>
              <textarea
                name="Obs_Persona"
                value={modalForm.Obs_Persona}
                onChange={handleModalChange}
                className="w-full rounded-lg border-2 px-2 py-1 text-sm"
                placeholder="Observaciones"
                rows="3"
              />
            </div>
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

export default Personal;
