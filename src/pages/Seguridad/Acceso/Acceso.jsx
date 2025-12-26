import React, { useState, useEffect, useRef } from "react";
import LargeModal from "../../../Components/BaseModal/LargeModel";
import {
  GrabarAcceso,
  EliminarAcceso,
  ListarAcceso,
  RecuperarAcceso,
} from "../../../services/Seguridad/Acceso/AccesoService";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
import { useToast } from "../../../Components/ui/toast";
import { Delete, Edit } from "lucide-react";
import TablePaginated from "../../../Components/ui/table-paginated";

const Acceso = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentFilter, setCurrentFilter] = useState({
    Cod_Acceso: null,
    Nombre_Acceso: "",
    Descripcion: "",
    Comando: null,
    Nivel: null,
    Estado: "T",
    Imagen: null,
    page_Number: 1,
    page_Size: 10,
  });

  const showErrorToast = (message) => {
    showToast(message, "error");
  };
  const showSuccessToast = (message) => {
    showToast(message, "success");
  };
  const [modalForm, setModalForm] = useState({
    Cod_Acceso: "",
    Nombre_Acceso: "",
    Descripcion: "",
    Comando: "",
    Nivel: "",
    Estado: "A",
    Imagen: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState({

    Nombre_Acceso: "",
    Descripcion: "",
    Estado: "T",
    page_Number: 1,
    page_Size: 10,
  });
  const isFirstSearch = useRef(true);
  const formRef = useRef(null);

  const cargarAccesos = async (filtro) => {
    // Dedupe: evita llamadas idénticas inmediatas
    if (!cargarAccesos.lastFetchKey) {
      cargarAccesos.lastFetchKey = null;
      cargarAccesos.lastFetchTime = 0;
    }
    const key = JSON.stringify(filtro || {});
    const now = Date.now();
    if (
      cargarAccesos.lastFetchKey === key &&
      now - cargarAccesos.lastFetchTime < 1000
    ) {
      return;
    }
    cargarAccesos.lastFetchKey = key;
    cargarAccesos.lastFetchTime = now;

    setLoading(true);
    try {
      const data = await ListarAcceso(filtro || {});
      // Normalizar diferentes posibles estructuras de respuesta
      if (!data) {
        setAccesos([]);
        setTotalRecords(0);
      } else if (Array.isArray(data)) {
        setAccesos(data || []);
        const total =
          data.length > 0 && data[0].totalRows != null
            ? Number(data[0].totalRows)
            : data.length;
        setTotalRecords(total);
      } else if (data.items && Array.isArray(data.items)) {
        setAccesos(data.items);
        setTotalRecords(Number(data.totalRows || data.totalRecords || data.total || 0));
      } else {
        const maybeItems = data.data || data.items || data.rows;
        if (Array.isArray(maybeItems)) {
          setAccesos(maybeItems);
          setTotalRecords(Number(data.totalRows || data.totalRecords || 0));
        } else {
          setAccesos(Array.isArray(data) ? data : []);
          setTotalRecords(Array.isArray(data) ? data.length : 0);
        }
      }
    } catch (e) {
      console.error("Error al listar accesos", e);
      setAccesos([]);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    const defaults = {
      Cod_Acceso: null,
      Nombre_Acceso: "",
      Descripcion: "",
      Comando: null,
      Nivel: null,
      Estado: "T",
      Imagen: null,
      page_Number: 1,
      page_Size: 10,
    };
    setCurrentFilter(defaults);
    cargarAccesos(defaults);
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
        Cod_Acceso: null,
        Nombre_Acceso: search.Nombre_Acceso || "",
        Descripcion: search.Descripcion || "",
        Comando: null,
        Nivel: null,
        Estado: search.Estado,
        Imagen: null,
        page_Number: 1,
        page_Size: currentFilter.page_Size || 10,
      };
      setCurrentFilter(filtro);
      // No actualizar `search` aquí: eso causaba un bucle
      cargarAccesos(filtro);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const validateForm = (f) => {
    const errors = {};
    if (!f.Cod_Acceso || String(f.Cod_Acceso).trim() === "")
      errors.Cod_Acceso = "Código de Acceso es obligatorio.";
    if (!f.Nombre_Acceso)
      errors.Nombre_Acceso = "Nombre de Acceso es obligatorio.";
    if (!f.Descripcion) errors.Descripcion = "Descripción es obligatoria.";

    // Nivel: permitir 0, pero exigir valor numérico >= 0
    const nivelRaw = f.Nivel;
    const nivel =
      nivelRaw === "" || nivelRaw === null || nivelRaw === undefined
        ? null
        : Number(nivelRaw);
    if (nivel === null || Number.isNaN(nivel)) {
      errors.Nivel = "Nivel es obligatorio.";
    } else if (nivel < 0) {
      errors.Nivel = "Nivel debe ser mayor o igual a 0.";
    }

    // Comando es obligatorio solo cuando Nivel > 0
    if (nivel > 0) {
      if (!f.Comando || String(f.Comando).trim() === "") {
        errors.Comando = "Comando es obligatorio cuando Nivel es mayor que 0.";
      }
    }

    if (!f.Estado) errors.Estado = "Estado es obligatorio.";
    return errors;
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "Nivel" ? (value === "" ? "" : Number(value)) : value;
    setModalForm((prev) => {
      // Si nivel es 0, limpiar Comando y deshabilitarlo
      if (name === "Nivel" && Number(newValue) === 0) {
        return { ...prev, [name]: newValue, Comando: "" };
      }
      return { ...prev, [name]: newValue };
    });
    setFormErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      // si nivel quedó en 0, quitar error de Comando también
      if (name === "Nivel" && Number(newValue) === 0) delete updated.Comando;
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result;
      setModalForm((prev) => ({ ...prev, Imagen: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    setModalMode("create");
    setModalForm({
      Cod_Acceso: "",
      Nombre_Acceso: "",
      Descripcion: "",
      Comando: "",
      Nivel: "",
      Estado: "A",
      Imagen: "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = async (acceso) => {
    setLoadingEdit(true);
    try {
      // Normalizar posible variación en nombres de propiedades
      const id = acceso?.Cod_Acceso ?? acceso?.cod_Acceso ?? "";
      const dataRaw = id ? await RecuperarAcceso(id) : acceso || {};
      const data = {
        Cod_Acceso: dataRaw.Cod_Acceso ?? dataRaw.cod_Acceso ?? "",
        Nombre_Acceso: dataRaw.Nombre_Acceso ?? dataRaw.nombre_Acceso ?? "",
        Descripcion: dataRaw.Descripcion ?? dataRaw.descripcion ?? "",
        Comando: dataRaw.Comando ?? dataRaw.comando ?? "",
        Nivel: dataRaw.Nivel ?? dataRaw.nivel ?? "",
        Estado: dataRaw.Estado ?? dataRaw.estado ?? "A",
        Imagen: dataRaw.Imagen ?? dataRaw.imagen ?? "",
      };
      setModalMode("edit");
      setModalForm({
        Cod_Acceso: data.Cod_Acceso,
        Nombre_Acceso: data.Nombre_Acceso,
        Descripcion: data.Descripcion,
        Comando: data.Comando,
        Nivel: data.Nivel,
        Estado: data.Estado,
        Imagen: data.Imagen,
      });
      setFormErrors({});
      setModalOpen(true);
    } catch (e) {
      console.error("Error al recuperar acceso", e);
      alert("Error al recuperar acceso.");
    }
    finally{setLoadingEdit(false);}
  };

  const handleDelete = async (Cod_Acceso) => {
    if (!window.confirm("¿Seguro que deseas eliminar este acceso?")) return;
    setLoading(true);
    try {
      const resp = await EliminarAcceso(Cod_Acceso);
      if (resp) {
        alert("Acceso eliminado correctamente.");
        cargarAccesos({
          Cod_Acceso: null,
          Nombre_Acceso: "",
          Descripcion: "",
          Comando: null,
          Nivel: null,
          Estado: "T",
          Imagen: null,
        });
      } else {
        alert("Error al eliminar acceso.");
        cargarAccesos({
          Cod_Acceso: null,
          Nombre_Acceso: "",
          Descripcion: "",
          Comando: null,
          Nivel: null,
          Estado: "T",
          Imagen: null,
        });
      }
    } catch (e) {
      console.error(e);
      alert("Error al eliminar acceso.");
    }
    setLoading(false);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Native HTML5 validation behavior like login: mark required fields and
    // conditionally require Comando when Nivel > 0, then use reportValidity()
    const formEl = formRef.current;
    try {
      const nivel =
        modalForm.Nivel === "" ||
        modalForm.Nivel === null ||
        modalForm.Nivel === undefined
          ? null
          : Number(modalForm.Nivel);
      if (formEl) {
        const comandoInput = formEl.querySelector('[name="Comando"]');
        if (comandoInput) {
          if (nivel !== null && nivel > 0) {
            comandoInput.setAttribute("required", "");
            if (!modalForm.Comando || String(modalForm.Comando).trim() === "") {
              comandoInput.setCustomValidity(
                "Comando es obligatorio cuando Nivel > 0."
              );
            } else {
              comandoInput.setCustomValidity("");
            }
          } else {
            comandoInput.removeAttribute("required");
            comandoInput.setCustomValidity("");
          }
        }

        if (!formEl.checkValidity()) {
          const firstInvalid = formEl.querySelector(":invalid");
          if (firstInvalid) {
            firstInvalid.reportValidity();
            firstInvalid.focus();
          }
          setLoading(false);
          return;
        }
      }

      const errors = validateForm(modalForm);
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) {
        setLoading(false);
        showErrorToast(errors[Object.keys(errors)[0]]);
        return;
      }
    } finally {
      // clear any custom validity on Comando to not affect later interactions
      if (formEl) {
        const comandoInput = formEl.querySelector('[name="Comando"]');
        if (comandoInput) comandoInput.setCustomValidity("");
      }
    }
    try {
      let oAcceso = {
        Cod_Acceso: modalForm.Cod_Acceso,
        Nombre_Acceso: modalForm.Nombre_Acceso,
        Descripcion: modalForm.Descripcion,
        Comando: modalForm.Comando ? modalForm.Comando : null,
        Nivel: modalForm.Nivel ? modalForm.Nivel : 0,
        Estado: modalForm.Estado,
        Imagen: modalForm.Imagen ? modalForm.Imagen : null,
      };
      const resp = await GrabarAcceso(oAcceso);
      if (resp) {
        showSuccessToast("Acceso guardado correctamente.");
        cargarAccesos(currentFilter);
        setModalOpen(false);
        setLoading(false);
      } else {
        showErrorToast("Error al guardar acceso.");
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

  const handlePageChange = (page) => {
    const newFiltros = { ...currentFilter, page_Number: page };
    setCurrentFilter(newFiltros);
    setSearch((s) => ({ ...s, page_Number: page }));
    cargarAccesos(newFiltros);
  };
  const handleRowsPerPageChange = (rowsPerPage) => {
    const newFiltros = { ...currentFilter, page_Size: rowsPerPage, page_Number: 1 };
    setCurrentFilter(newFiltros);
    setSearch((s) => ({ ...s, page_Number: 1, page_Size: rowsPerPage }));
    cargarAccesos(newFiltros);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FullScreenLoading isVisible={loading} message="Cargando..." />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GESTIÓN DE ACCESOS</h1>
            <p className="text-muted-foreground">
              Administra los accesos del sistema.
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
                Nombre Acceso
              </label>
              <Input
                name="Nombre_Acceso"
                value={search.Nombre_Acceso}
                onChange={handleSearchChange}
                placeholder="Ingrese Nombre Acceso"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Descripcion Acceso
              </label>
              <Input
                name="Descripcion"
                value={search.Descripcion}
                onChange={handleSearchChange}
                placeholder="Ingrese Descripcion"
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
                cargarAccesos({
                  Cod_Acceso: null,
                  Nombre_Acceso: search.Nombre_Acceso || "",
                  Descripcion: search.Descripcion || "",
                  Comando: null,
                  Nivel: null,
                  Estado: search.Estado,
                  Imagen: null,
                })
              }
            >
              🔍 Buscar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearch({
                  Cod_Acceso: null,
                  Nombre_Acceso: "",
                  Descripcion: "",
                  Comando: null,
                  Nivel: null,
                  Estado: "T",
                  Imagen: null,
                });
                cargarAccesos({
                  Cod_Acceso: null,
                  Nombre_Acceso: "",
                  Descripcion: "",
                  Comando: null,
                  Nivel: null,
                  Estado: "T",
                  Imagen: null,
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
        {/* Tabla con paginación del servidor */}
        <TablePaginated
          size="sm"
          title="Actividads de Accesos del Sistema"
          headers={[
            { label: "Código", key: "cod_Acceso" },
            { label: "Nombre", key: "nombre_Acceso" },
            { label: "Descripción", key: "descripcion" },
            { label: "Comando", key: "comando" },
            { label: "Nivel", key: "nivel" },
            { label: "Estado", key: "estado" }
          ]}
          data={accesos}
          acciones={[
            {
                icon: <Edit className="w-4 h-4" />,
                label: loadingEdit ? 'Cargando...' : 'Editar',
                onClick: (accesos) => handleEdit(accesos)
            },
            {
              icon: <Delete className="w-4 h-4" />,
              label: "Eliminar",
              onClick: (accesos) => handleDelete(accesos.cod_Acceso)
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

      <LargeModal
        show={modalOpen}
        title={modalMode === "create" ? "Crear Acceso" : "Editar Acceso"}
        onClose={() => setModalOpen(false)}
        className="w-auto h-auto max-w-fit max-h-fit"
      >
        <form
          ref={formRef}
          onSubmit={handleModalSubmit}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Código Acceso
              </label>
              <input
                name="Cod_Acceso"
                value={modalForm.Cod_Acceso}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Cod_Acceso ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Código único"
                disabled={modalMode === "edit"}
                required={modalMode === "create"}
              />
              {formErrors.Cod_Acceso && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Cod_Acceso}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nombre Acceso
              </label>
              <input
                name="Nombre_Acceso"
                value={modalForm.Nombre_Acceso}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Nombre_Acceso ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Nombre del acceso"
              />
              {formErrors.Nombre_Acceso && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Nombre_Acceso}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Descripción
              </label>
              <input
                name="Descripcion"
                value={modalForm.Descripcion}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Descripcion ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Descripción"
              />
              {formErrors.Descripcion && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Descripcion}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Nivel</label>
              <input
                type="text"
                name="Nivel"
                value={modalForm.Nivel}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Nivel ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Nivel numérico"
              />
              {formErrors.Nivel && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Nivel}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Comando</label>
              <input
                name="Comando"
                value={modalForm.Comando}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Comando ? "border-red-500 bg-red-50" : ""
                } ${
                  Number(modalForm.Nivel) === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={Number(modalForm.Nivel) === 0}
                placeholder="Comando"
              />
              {formErrors.Comando && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Comando}
                </label>
              )}
              <label className="text-xs text-gray-500 mt-1 block">
                Obligatorio si Nivel &gt; 0
              </label>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                name="Estado"
                value={modalForm.Estado}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Estado ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="A">Activo</option>
                <option value="X">Inactivo</option>
              </select>
              {formErrors.Estado && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Estado}
                </label>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`block w-full text-sm px-2 py-1 border-2 rounded-lg ${
                  formErrors.Imagen
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {modalForm.Imagen && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Preview:</p>
                  <img
                    src={modalForm.Imagen}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
              {formErrors.Imagen && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Imagen}
                </label>
              )}
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

export default Acceso;
