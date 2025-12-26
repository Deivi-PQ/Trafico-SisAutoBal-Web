import React, { useState, useEffect, useCallback } from "react";
import LargeModal from "../../../Components/BaseModal/LargeModel";
import {
  GrabarTag_RFID,
  EliminarTag_RFID,
  ListarTag_RFID,
  RecuperarTag_RFID,
} from "../../../services/AutoBal/Tag_RFID/Tag_RFIDService.js";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
import { useToast } from "../../../Components/ui/toast";

// Dedupe across component remounts (React Strict Mode mounts/unmounts in dev)
let _tagsLastFetchKey = null;
let _tagsLastFetchTime = 0;

const Tag_RFID = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const showErrorToast = (message) => {
    showToast(message, "error");
  };
  const showSuccessToast = (message) => {
    showToast(message, "success");
  };

  const [modalForm, setModalForm] = useState({
    Cod_RFID: "",
    Nro_Placa: "",
    DateNew: "",
    DateEdit: "",
    UserNew: "",
    UserEdit: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const cargarTags = useCallback(async (filtro) => {
    setLoading(true);
    try {
      const data = await ListarTag_RFID(filtro || {});
      setTags(data || []);
    } catch (e) {
      showErrorToast(e?.message || "Error al listar tags RFID.");
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDateToDDMMAA = (value) => {
    if (!value) return "";
    try {
      // If value is an object/date already
      let d = value instanceof Date ? value : new Date(value);
      if (isNaN(d)) {
        const n = Number(value);
        if (!isNaN(n)) d = new Date(n);
        else return String(value);
      }
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear());
      return `${day} - ${month} - ${year}`;
    } catch {
      return String(value);
    }
  };

  useEffect(() => {
    cargarTags({ Cod_RFID: "", Nro_Placa: "" });
  }, [cargarTags]);
  // Note: search filtering is performed only when the user clicks 'Buscar'.

  const validateForm = (f) => {
    const errors = {};
    if (!String(f.Cod_RFID || "").trim())
      errors.Cod_RFID = "Código RFID es obligatorio.";
    if (!f.Nro_Placa) errors.Nro_Placa = "Número de Placa es obligatorio.";
    return errors;
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "Nro_Placa" ? value.toUpperCase() : value;
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
      Cod_RFID: "",
      Nro_Placa: "",
      DateNew: "",
      DateEdit: "",
      UserNew: "",
      UserEdit: "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = async (tag) => {
    try {
      // Normalizar posible variación en nombres de propiedades
      const id = tag?.Cod_RFID ?? tag?.cod_RFID ?? "";
      const dataRaw = id ? await RecuperarTag_RFID(id) : tag || {};
      const data = {
        Cod_RFID: dataRaw.Cod_RFID ?? dataRaw.cod_RFID ?? "",
        Nro_Placa: (dataRaw.Nro_Placa ?? dataRaw.nro_Placa ?? "")
          .toString()
          .toUpperCase(),
        DateNew: dataRaw.DateNew ?? dataRaw.dateNew ?? "",
        DateEdit: dataRaw.DateEdit ?? dataRaw.dateEdit ?? "",
        UserNew: dataRaw.UserNew ?? dataRaw.userNew ?? "",
        UserEdit: dataRaw.UserEdit ?? dataRaw.userEdit ?? "",
      };
      setModalMode("edit");
      setModalForm(data);
      setFormErrors({});
      setModalOpen(true);
    } catch (e) {
      showErrorToast("Error al recuperar tag RFID: " + e.message);
    }
  };

  const handleDelete = async (Cod_RFID) => {
    if (!window.confirm("¿Seguro que deseas eliminar este tag RFID?")) return;
    setLoading(true);
    try {
      const resp = await EliminarTag_RFID(Cod_RFID);
      if (resp) {
        showSuccessToast("Tag RFID eliminado correctamente.");
        cargarTags({ Cod_RFID: "", Nro_Placa: "" });
      } else {
        showErrorToast("Error al eliminar tag RFID.");
        cargarTags({ Cod_RFID: "", Nro_Placa: "" });
      }
    } catch (e) {
      showErrorToast("Error al eliminar tag RFID." + e.message);
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
      // Obtener datos del usuario y menús desde localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const oTag = {
        Cod_RFID: modalForm.Cod_RFID,
        Nro_Placa: modalForm.Nro_Placa,
        DateNew: null,
        DateEdit: null,
        UserNew: userData.id,
        UserEdit: userData.id,
      };
      const resp = await GrabarTag_RFID(oTag);
      if (resp) {
        showSuccessToast("Tag RFID guardado correctamente.");
        const cod =
          document.querySelector('input[name="Cod_RFID"]')?.value || "*";
        const placa =
          document.querySelector('input[name="Nro_Placa"]')?.value || "*";
        cargarTags({ Cod_RFID: cod, Nro_Placa: placa });
        setModalOpen(false);
        setLoading(false);
      } else {
        showErrorToast("Error al guardar tag RFID.");
        setLoading(false);
      }
    } catch (e) {
      showErrorToast(e.message || "Error al guardar tag RFID.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FullScreenLoading isVisible={loading} message="Cargando..." />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GESTIÓN DE TAGS RFID</h1>
            <p className="text-muted-foreground">
              Administra los tags RFID del sistema.
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
                Código RFID
              </label>
              <Input
                name="Cod_RFID"
                defaultValue={""}
                placeholder="Ingrese Código RFID"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Número Placa
              </label>
              <Input
                name="Nro_Placa"
                defaultValue={""}
                placeholder="Ingrese Número Placa"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => {
                const cod =
                  document.querySelector('input[name="Cod_RFID"]')?.value ||
                  "*";
                const placa =
                  document.querySelector('input[name="Nro_Placa"]')?.value ||
                  "*";
                cargarTags({ Cod_RFID: cod, Nro_Placa: placa });
              }}
            >
              🔍 Buscar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const codInput = document.querySelector(
                  'input[name="Cod_RFID"]'
                );
                const placaInput = document.querySelector(
                  'input[name="Nro_Placa"]'
                );
                if (codInput) codInput.value = "";
                if (placaInput) placaInput.value = "";
                cargarTags({ Cod_RFID: "*", Nro_Placa: "*" });
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
            <div className="p-8 text-center">Cargando tags RFID...</div>
          ) : (
            <div>
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  Tags RFID ({tags.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Código RFID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Número Placa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Fecha Creación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Usuario Creación
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {tags.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          No se encontraron Tags RFID
                        </td>
                      </tr>
                    ) : (
                      tags.map((tag, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {tag.Cod_RFID ?? tag.cod_RFID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {tag.Nro_Placa ?? tag.nro_Placa}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatDateToDDMMAA(tag.DateNew ?? tag.dateNew)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {tag.UserNew ?? tag.userNew}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(tag)}
                              >
                                ✏️ Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete(tag.Cod_RFID ?? tag.cod_RFID)
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
        title={
          modalMode === "create"
            ? "Nuevo Tag_RFID Nro. Placa"
            : "Editar Tag_RFID Nro. Placa"
        }
        onClose={() => setModalOpen(false)}
        className="w-auto h-auto max-w-fit max-h-fit"
      >
        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Código RFID */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Código RFID
              </label>
              <input
                name="Cod_RFID"
                value={modalForm.Cod_RFID}
                onChange={handleModalChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.Cod_RFID ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Código único RFID"
                disabled={modalMode === "edit"}
              />
              {formErrors.Cod_RFID && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Cod_RFID}
                </label>
              )}
            </div>

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
                placeholder="Número de Placa"
              />
              {formErrors.Nro_Placa && (
                <label className="text-xs text-red-600 mt-1 block">
                  {formErrors.Nro_Placa}
                </label>
              )}
            </div>

            {/* Fecha Nueva (Read-only) */}
            <div style={{ display: "none" }}>
              <label className="text-sm font-medium mb-2 block">
                Fecha Creación
              </label>
              <input
                name="DateNew"
                type="datetime-local"
                value={modalForm.DateNew}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 bg-gray-100"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                (Generado automáticamente)
              </p>
            </div>

            {/* Fecha Edición (Read-only) */}
            <div style={{ display: "none" }}>
              <label className="text-sm font-medium mb-2 block">
                Fecha Edición
              </label>
              <input
                name="DateEdit"
                type="datetime-local"
                value={modalForm.DateEdit}
                className="input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 bg-gray-100"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                (Generado automáticamente)
              </p>
            </div>

            {/* Usuario Nueva (Read-only) */}
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
              <p className="text-xs text-gray-500 mt-1">
                (Asignado automáticamente)
              </p>
            </div>

            {/* Usuario Edición (Read-only) */}
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
              <p className="text-xs text-gray-500 mt-1">
                (Asignado automáticamente)
              </p>
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

export default Tag_RFID;
