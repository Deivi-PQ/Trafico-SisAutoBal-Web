import React, { useState, useEffect, useRef } from "react";
import LargeModal from "../../../Components/BaseModal/LargeModel";
import {
  GrabarPerfil,
  EliminarPerfil,
  ListarPerfil,
  RecuperarPerfil,
} from "../../../services/Seguridad/Perfil/PerfilService";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
import { useToast } from "../../../Components/ui/toast";

const Perfil_Usuario = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const showErrorToast = (message) => {
    showToast(message, "error");
  };
  const showSuccessToast = (message) => {
    showToast(message, "success");
  };
  const [modalForm, setModalForm] = useState({
    IDPerfil: "",
    Des_Perfil: "",
    Estado: "A",
  });
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState({
    IDPerfil: "",
    Des_Perfil: "",
    Estado: "T",
  });
  const isFirstSearch = useRef(true);

  const cargarPerfiles = async (filtro) => {
    // Dedupe: evita llamadas idénticas inmediatas (p. ej. doble montaje en StrictMode)
    if (!cargarPerfiles.lastFetchKey) {
      cargarPerfiles.lastFetchKey = null;
      cargarPerfiles.lastFetchTime = 0;
    }
    const key = JSON.stringify(filtro || {});
    const now = Date.now();
    if (
      cargarPerfiles.lastFetchKey === key &&
      now - cargarPerfiles.lastFetchTime < 1000
    ) {
      return; // ignorar llamada duplicada reciente
    }
    cargarPerfiles.lastFetchKey = key;
    cargarPerfiles.lastFetchTime = now;

    setLoading(true);
    try {
      const data = await ListarPerfil(filtro || {});
      setPerfiles(data || []);
    } catch (e) {
      console.error("Error al listar perfiles", e);
      setPerfiles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarPerfiles({ IDPerfil: "0", Des_Perfil: "", Estado: "T" });
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
        IDPerfil: search.IDPerfil || "0",
        Des_Perfil: search.Des_Perfil,
        Estado: search.Estado,
      };
      cargarPerfiles(filtro);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const validateForm = (f) => {
    const errors = {};
    if (!f.IDPerfil && f.IDPerfil !== 0)
      errors.IDPerfil = "IDPerfil es obligatorio.";
    if (!f.Des_Perfil) errors.Des_Perfil = "Descripción es obligatoria.";
    if (!f.Estado) errors.Estado = "Estado es obligatorio.";
    return errors;
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalForm((prev) => ({ ...prev, [name]: value }));
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
      IDPerfil: "",
      Des_Perfil: "",
      Estado: "A",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = async (perfil) => {
    try {
      // Normalizar posible variación en nombres de propiedades
      const id = perfil?.IDPerfil ?? perfil?.idPerfil ?? "";
      const dataRaw = id ? await RecuperarPerfil(id) : perfil || {};
      const data = {
        IDPerfil: dataRaw.IDPerfil ?? dataRaw.idPerfil ?? "",
        Des_Perfil: dataRaw.Des_Perfil ?? dataRaw.des_Perfil ?? "",
        Estado: dataRaw.Estado ?? dataRaw.estado ?? "A",
      };
      setModalMode("edit");
      setModalForm({
        IDPerfil: data.IDPerfil,
        Des_Perfil: data.Des_Perfil,
        Estado: data.Estado,
      });
      setFormErrors({});
      setModalOpen(true);
    } catch (e) {
      console.error("Error al recuperar perfil", e);
      alert("Error al recuperar perfil.");
    }
  };

  const handleDelete = async (IDPerfil) => {
    if (!window.confirm("¿Seguro que deseas eliminar este perfil?")) return;
    setLoading(true);
    try {
      const resp = await EliminarPerfil(IDPerfil);
      if (resp) {
        alert("Perfil eliminado correctamente.");
        cargarPerfiles({ IDPerfil: "0", Des_Perfil: "", Estado: "T" });
      } else {
        alert("Error al eliminar perfil.");
        cargarPerfiles({ IDPerfil: "0", Des_Perfil: "", Estado: "T" });
      }
    } catch (e) {
      console.error(e);
      alert("Error al eliminar perfil.");
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
      let oPerfil;
      if (modalMode === "create") {
        oPerfil = {
          IDPerfil: modalForm.IDPerfil,
          Des_Perfil: modalForm.Des_Perfil,
          Estado: modalForm.Estado,
        };
      } else {
        oPerfil = {
          IDPerfil: modalForm.IDPerfil,
          Des_Perfil: modalForm.Des_Perfil,
          Estado: modalForm.Estado,
        };
      }
      const resp = await GrabarPerfil(oPerfil);
      if (resp) {
        showSuccessToast("Perfil guardado correctamente.");
        cargarPerfiles({ ...search, IDPerfil: search.IDPerfil || "0" });
        setModalOpen(false);
        setLoading(false);
      } else {
        showErrorToast("Error al guardar perfil.");
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
            <h1 className="text-2xl font-bold">GESTIÓN DE PERFILES</h1>
            <p className="text-muted-foreground">
              Administra los perfiles del sistema.
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
                ID Perfil
              </label>
              <Input
                name="IDPerfil"
                value={search.IDPerfil}
                onChange={handleSearchChange}
                placeholder="Ingrese ID Perfil"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Descripción
              </label>
              <Input
                name="Des_Perfil"
                value={search.Des_Perfil}
                onChange={handleSearchChange}
                placeholder="Ingrese Descripción"
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
                cargarPerfiles({ ...search, IDPerfil: search.IDPerfil || "0" })
              }
            >
              🔍 Buscar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearch({ IDPerfil: "", Des_Perfil: "", Estado: "T" });
                cargarPerfiles({ IDPerfil: "0", Des_Perfil: "", Estado: "T" });
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
            <div className="p-8 text-center">Cargando perfiles...</div>
          ) : (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  Perfiles ({perfiles.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        ID Perfil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Descripción
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
                    {perfiles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-500"
                        >
                          No se encontraron Perfiles
                        </td>
                      </tr>
                    ) : (
                      perfiles.map((p, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.IDPerfil ?? p.idPerfil}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.Des_Perfil ?? p.des_Perfil}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.Estado ?? p.estado}
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
                                  handleDelete(p.IDPerfil ?? p.idPerfil)
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
        title={modalMode === "create" ? "Crear Perfil" : "Editar Perfil"}
        onClose={() => setModalOpen(false)}
        className="w-auto h-auto max-w-fit max-h-fit"
      >
        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                ID Perfil
              </label>
              <input
                name="IDPerfil"
                value={modalForm.IDPerfil}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.IDPerfil ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Número único de perfil"
                disabled={modalMode === "edit"}
              />
              {formErrors.IDPerfil && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.IDPerfil}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Descripción
              </label>
              <input
                name="Des_Perfil"
                value={modalForm.Des_Perfil}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Des_Perfil ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Ingrese Descripción"
              />
              {formErrors.Des_Perfil && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Des_Perfil}
                </label>
              )}
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

export default Perfil_Usuario;
