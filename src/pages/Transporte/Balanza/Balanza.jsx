import React, { useState, useEffect, useCallback } from "react";
import LargeModal from "../../../Components/BaseModal/LargeModel";
import {
  GrabarBalanza,
  EliminarBalanza,
  ListarBalanza,
  RecuperarBalanza,
} from "../../../services/Transporte/Balanza/BalanzaService";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
import { useToast } from "../../../Components/ui/toast";

const Balanza = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [balanzas, setBalanzas] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const showErrorToast = (m) => showToast(m, "error");
  const showSuccessToast = (m) => showToast(m, "success");

  const [modalForm, setModalForm] = useState({
    IDBalanza: "",
    Des_Balanza: "",
    Tipo: "",
    UserNew: "",
    DateNew: "",
    UserEdit: "",
    DateEdit: "",
    Estado: "A",
    SN_Contr: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState({
    Des_Balanza: "",
    Tipo: "",
    Estado: "T",
    SN_Contr: "",
  });

  const cargarBalanzas = useCallback(async (filtro) => {
    setLoading(true);
    try {
      const data = await ListarBalanza(filtro || {});
      setBalanzas(data || []);
    } catch (e) {
      showErrorToast(e?.message || "Error al listar balanzas.");
      setBalanzas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBalanzas({ Des_Balanza: "", Tipo: "", Estado: "T", SN_Contr: "" });
  }, [cargarBalanzas]);

  useEffect(() => {
    const filtro = {
      Des_Balanza: search.Des_Balanza || "*",
      Tipo: search.Tipo || "*",
      Estado: search.Estado || "*",
      SN_Contr: search.SN_Contr || "*",
    };
    cargarBalanzas(filtro);
  }, [search, cargarBalanzas]);

  const validateForm = (f) => {
    const errors = {};
    if (!f.IDBalanza || String(f.IDBalanza).trim() === "")
      errors.IDBalanza = "ID Balanza es obligatorio.";
    if (!f.Des_Balanza || String(f.Des_Balanza).trim() === "")
      errors.Des_Balanza = "Descripción es obligatoria.";
    if (!f.Tipo || String(f.Tipo).trim() === "")
      errors.Tipo = "Tipo es obligatorio.";
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
      IDBalanza: "",
      Des_Balanza: "",
      Tipo: "",
      UserNew: "",
      DateNew: "",
      UserEdit: "",
      DateEdit: "",
      Estado: "A",
      SN_Contr: "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = async (b) => {
    try {
      const id = b?.IDBalanza ?? b?.idBalanza ?? "";
      const dataRaw = id ? await RecuperarBalanza(id) : b || {};
      const data = {
        IDBalanza: dataRaw.IDBalanza ?? dataRaw.idBalanza ?? "",
        Des_Balanza: dataRaw.Des_Balanza ?? dataRaw.des_Balanza ?? "",
        Tipo: dataRaw.Tipo ?? dataRaw.tipo ?? "",
        UserNew: dataRaw.UserNew ?? dataRaw.userNew ?? "",
        DateNew: dataRaw.DateNew ?? dataRaw.dateNew ?? "",
        UserEdit: dataRaw.UserEdit ?? dataRaw.userEdit ?? "",
        DateEdit: dataRaw.DateEdit ?? dataRaw.dateEdit ?? "",
        Estado: dataRaw.Estado ?? dataRaw.estado ?? "A",
        SN_Contr: dataRaw.SN_Contr ?? dataRaw.sN_Contr ?? "",
      };
      setModalMode("edit");
      setModalForm(data);
      setFormErrors({});
      setModalOpen(true);
    } catch (e) {
      console.error("Error al recuperar balanza", e);
      alert("Error al recuperar balanza.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta balanza?")) return;
    setLoading(true);
    try {
      const resp = await EliminarBalanza(id);
      if (resp) {
        showSuccessToast("Balanza eliminada correctamente.");
        cargarBalanzas({
          Des_Balanza: "",
          Tipo: "",
          Estado: "T",
          SN_Contr: "",
        });
      } else {
        showErrorToast("Error al eliminar balanza.");
        cargarBalanzas({
          Des_Balanza: "",
          Tipo: "",
          Estado: "T",
          SN_Contr: "",
        });
      }
    } catch (e) {
      console.error(e);
      showErrorToast(e.message || "Error al eliminar balanza.");
    }
    setLoading(false);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const errors = validateForm(modalForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        IDBalanza: modalForm.IDBalanza,
        Des_Balanza: modalForm.Des_Balanza,
        Tipo: modalForm.Tipo,
        Estado: modalForm.Estado,
        SN_Contr: modalForm.SN_Contr || null,
        UserNew: modalForm.UserNew || userData.id,
        UserEdit: userData.id,
      };
      const resp = await GrabarBalanza(payload);
      if (resp) {
        showSuccessToast("Balanza guardada correctamente.");
        cargarBalanzas({ ...search, Des_Balanza: search.Des_Balanza || "*" });
        setModalOpen(false);
      } else {
        showErrorToast("Error al guardar balanza.");
      }
    } catch (e) {
      console.error(e);
      showErrorToast(e.message || "Error al guardar balanza.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FullScreenLoading isVisible={loading} message="Cargando..." />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GESTIÓN DE BALANZAS</h1>
            <p className="text-muted-foreground">Administra las balanzas.</p>
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
                Descripción
              </label>
              <Input
                name="Des_Balanza"
                defaultValue={search.Des_Balanza}
                placeholder="Ingrese descripción"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Input
                name="Tipo"
                defaultValue={search.Tipo}
                placeholder="Tipo"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                name="Estado"
                defaultValue={search.Estado}
                className="flex h-9 w-full rounded-md border px-3"
              >
                <option value="T">Todos</option>
                <option value="A">Activo</option>
                <option value="X">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SN Contr</label>
              <Input
                name="SN_Contr"
                defaultValue={search.SN_Contr}
                placeholder="SN Contr"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => {
                const des =
                  document.querySelector('input[name="Des_Balanza"]')?.value ||
                  "*";
                const tipo =
                  document.querySelector('input[name="Tipo"]')?.value || "*";
                const estado =
                  document.querySelector('select[name="Estado"]')?.value || "*";
                const sn =
                  document.querySelector('input[name="SN_Contr"]')?.value ||
                  "*";
                cargarBalanzas({
                  Des_Balanza: des,
                  Tipo: tipo,
                  Estado: estado,
                  SN_Contr: sn,
                });
              }}
            >
              🔍 Buscar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const desInput = document.querySelector(
                  'input[name="Des_Balanza"]'
                );
                const tipoInput = document.querySelector('input[name="Tipo"]');
                const estadoSelect = document.querySelector(
                  'select[name="Estado"]'
                );
                const snInput = document.querySelector(
                  'input[name="SN_Contr"]'
                );
                if (desInput) desInput.value = "";
                if (tipoInput) tipoInput.value = "";
                if (estadoSelect) estadoSelect.value = "T";
                if (snInput) snInput.value = "";
                setSearch({
                  Des_Balanza: "",
                  Tipo: "",
                  Estado: "T",
                  SN_Contr: "",
                });
                cargarBalanzas({
                  Des_Balanza: "*",
                  Tipo: "*",
                  Estado: "*",
                  SN_Contr: "*",
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
            <div className="p-8 text-center">Cargando balanzas...</div>
          ) : (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  Balanzas ({balanzas.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        SN Controladora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {balanzas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          No se encontraron Balanzas
                        </td>
                      </tr>
                    ) : (
                      balanzas.map((b, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {b.IDBalanza ?? b.idBalanza}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {b.Des_Balanza ?? b.des_Balanza}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {b.Tipo ?? b.tipo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {b.SN_Contr ?? b.sN_Contr}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                (b.Estado ?? b.estado) === "A"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {(b.Estado ?? b.estado) === "A"
                                ? "Activo"
                                : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(b)}
                              >
                                ✏️ Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete(b.IDBalanza ?? b.idBalanza)
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
        title={modalMode === "create" ? "Crear Balanza" : "Editar Balanza"}
        onClose={() => setModalOpen(false)}
        className="w-auto h-auto max-w-fit max-h-fit"
      >
        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                ID Balanza
              </label>
              <input
                name="IDBalanza"
                value={modalForm.IDBalanza}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.IDBalanza ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="ID único"
                disabled={modalMode === "edit"}
              />
              {formErrors.IDBalanza && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.IDBalanza}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Descripción
              </label>
              <input
                name="Des_Balanza"
                value={modalForm.Des_Balanza}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Des_Balanza ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Descripción"
              />
              {formErrors.Des_Balanza && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Des_Balanza}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <input
                name="Tipo"
                value={modalForm.Tipo}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Tipo ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Tipo"
              />
              {formErrors.Tipo && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Tipo}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SN Contr</label>
              <input
                name="SN_Contr"
                value={modalForm.SN_Contr}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.SN_Contr ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="SN Contr"
              />
              {formErrors.SN_Contr && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.SN_Contr}
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
            <div style={{ display: "none" }}>
              <label className="text-sm font-medium mb-2 block">
                Usuario Creación
              </label>
              <input
                name="UserNew"
                value={modalForm.UserNew}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 bg-gray-100"
                disabled
              />
            </div>
            <div style={{ display: "none" }}>
              <label className="text-sm font-medium mb-2 block">
                Fecha Creación
              </label>
              <input
                name="DateNew"
                value={modalForm.DateNew}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 bg-gray-100"
                disabled
              />
            </div>
            <div style={{ display: "none" }}>
              <label className="text-sm font-medium mb-2 block">
                Usuario Edición
              </label>
              <input
                name="UserEdit"
                value={modalForm.UserEdit}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 bg-gray-100"
                disabled
              />
            </div>
            <div style={{ display: "none" }}>
              <label className="text-sm font-medium mb-2 block">
                Fecha Edición
              </label>
              <input
                name="DateEdit"
                value={modalForm.DateEdit}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 bg-gray-100"
                disabled
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

export default Balanza;
