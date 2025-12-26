import BaseLayout from "../../../Components/baselayout/BaseLayout";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../../Components/ui/button";
import { GrabarT, EliminarT } from "../../../services/Global/Tabla/TablaService";
import { ListarT } from "../../../services/Global/Tabla/TablaService";
import { Modal } from "../../../Components/ui/modal";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
function Tabla() {
    // Para spinner en guardar/actualizar
    const [saving, setSaving] = useState(false); // Para spinner en guardar/actualizar
    // Estado para advertencias
    const [addChildErrors, setAddChildErrors] = useState({ desTabla: '', estado: '' });
    // Mensaje de advertencia/éxito tipo label
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("success"); // 'success' o 'error'
    const alertTimeoutRef = useRef(null);
    const showAlert = (msg, type = "success") => {
        setAlertMessage(msg);
        setAlertType(type);
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => setAlertMessage(""), 10000);
    };
    useEffect(() => () => { if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current); }, []);
    // Estado para modal de confirmación de eliminación
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);

    // Eliminar registro con spinner y notificación
    const confirmDelete = async () => {
        if (!rowToDelete) return;
        setSaving(true);
        try {
            // Si es padre, elimina primero los hijos en backend y vista, luego el padre
            const isPadre = !rowToDelete.cdPadre || rowToDelete.cdPadre === 0 || rowToDelete.cdPadre === null || rowToDelete.cdPadre === undefined;
            if (isPadre) {
                // Encuentra hijos
                const hijos = tablaData.filter(item => item.cdPadre === rowToDelete.cdTabla);
                for (const hijo of hijos) {
                    try {
                        await EliminarT(hijo.cdTabla);
                    } catch {
                        showAlert('No se pudo eliminar el hijo con código ' + hijo.cdTabla + '. Operación cancelada.', 'error');
                        setSaving(false);
                        return;
                    }
                }
                setTablaData(prev => prev.filter(item => item.cdPadre !== rowToDelete.cdTabla)); // Elimina hijos en vista
                await new Promise(res => setTimeout(res, 100));
            }
            await EliminarT(rowToDelete.cdTabla);
            setTablaData(prev => prev.filter(item => item.cdTabla !== rowToDelete.cdTabla)); // Elimina padre
            setDeleteModalOpen(false);
            setRowToDelete(null);
            showAlert("¡Registro eliminado correctamente!", "success");
        } catch (err) {
            showAlert(err.message || 'Error al eliminar el registro', "error");
        } finally {
            setSaving(false);
        }
    };
    // Eliminar registro con spinner y notificación
    const handleDelete = (row) => {
        setRowToDelete(row);
        setDeleteModalOpen(true);
    };
    // Guardar hijo en la API
    const handleAddChildSubmit = async (e) => {
        e.preventDefault();
        let hasError = false;
        const errors = { desTabla: '', estado: '' };
        if (!addChildData.desTabla || addChildData.desTabla.trim() === "") {
            errors.desTabla = "La descripción es obligatoria.";
            hasError = true;
        }
        if (!addChildData.estado || addChildData.estado.trim() === "") {
            errors.estado = "El estado es obligatorio.";
            hasError = true;
        }
        setAddChildErrors(errors);
        if (hasError) return;
        setSaving(true);
        try {
            await GrabarT({
                CdTabla: 0, // o vacío, el backend debe asignar
                DesTabla: addChildData.desTabla,
                CdPadre: addChildData.cdPadre,
                Obs_Tabla: addChildData.obs_Tabla,
                Estado: addChildData.estado,
            });
            setAddChildModalOpen(false);
            fetchTablaData();
            showAlert("¡Hijo guardado correctamente!", "success");
        } catch (err) {
            showAlert(err.message || 'Error al guardar el hijo', "error");
        } finally {
            setSaving(false);
        }
    };
    // Estado para modal de agregar hijo
    const [addChildModalOpen, setAddChildModalOpen] = useState(false);
    const [addChildData, setAddChildData] = useState({
        cdTabla: '',
        desTabla: '',
        cdPadre: '',
        obs_Tabla: '',
        estado: 'A',
    });
    // Abrir modal para agregar hijo
    const handleAddChild = (cdPadre) => {
        setAddChildData({
            cdTabla: '',
            desTabla: '',
            cdPadre: cdPadre,
            obs_Tabla: '',
            estado: 'A',
        });
        setAddChildModalOpen(true);
    };
    // Cerrar modal agregar hijo
    const handleCloseAddChildModal = () => setAddChildModalOpen(false);
    // Manejar cambios en los inputs del modal agregar hijo
    const handleAddChildInput = (e) => {
    const { name, value } = e.target;
    setAddChildData(prev => ({ ...prev, [name]: value }));
    setAddChildErrors(prev => ({ ...prev, [name]: '' })); // Limpia error al escribir
};

    // Estado para modal de edición
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({
        cdTabla: '',
        desTabla: '',
        cdPadre: '',
        obs_Tabla: '',
        estado: 'A',
    });
    // Abrir modal y setear datos
    const handleEdit = (row) => {
        // Si es padre (sin cdPadre o cdPadre 0/null/undefined), poner cdPadre=0; si es hijo, mantener
        const esPadre = !row.cdPadre || row.cdPadre === 0 || row.cdPadre === null || row.cdPadre === undefined;
        setEditData({
            cdTabla: row.cdTabla,
            desTabla: row.desTabla,
            cdPadre: esPadre ? 0 : row.cdPadre,
            obs_Tabla: row.obs_Tabla || '',
            estado: row.estado || 'A',
        });
        setEditModalOpen(true);
    };
    // Cerrar modal
    const handleCloseModal = () => setEditModalOpen(false);
    // Manejar cambios en los inputs del modal
    const handleEditInput = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };
    // Guardar cambios de edición SOLO en la tabla (no recargar toda la vista)
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await GrabarT({
                CdTabla: editData.cdTabla,
                DesTabla: editData.desTabla,
                CdPadre: editData.cdPadre,
                Obs_Tabla: editData.obs_Tabla,
                Estado: editData.estado,
            });
            setEditModalOpen(false);
            setTablaData(prev => prev.map(item => item.cdTabla === editData.cdTabla ? { ...item, ...editData } : item));
            showAlert("¡Registro actualizado correctamente!", "success");
        } catch (err) {
            showAlert(err.message || 'Error al actualizar el registro', "error");
        } finally {
            setSaving(false);
        }
    };
    // Estado para filtro de búsqueda
    const [search, setSearch] = useState("");

    // Estado para datos de tabla
    const [tablaData, setTablaData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({});
    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    // Función para cargar datos desde API
    const fetchTablaData = () => {
        setLoading(true);
        ListarT('Todos')
            .then(data => {
                setTablaData(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Error al cargar datos');
                setLoading(false);
            });
    };

    // Cargar datos al montar
    useEffect(() => {
        fetchTablaData();
    }, []);

    // Agrupar padres e hijos según reglas de IDs (siempre con datos actuales y campos correctos)
    // Filtro aplicado a padres e hijos
    const lowerSearch = search.trim().toLowerCase();
    const filterFn = (item) => {
        if (!lowerSearch) return true;
        return (
            (item.desTabla && item.desTabla.toLowerCase().includes(lowerSearch)) ||
            (item.obs_Tabla && item.obs_Tabla.toLowerCase().includes(lowerSearch))
        );
    };
    const getPadres = () => tablaData.filter(item => (!item.cdPadre || item.cdPadre === 0 || item.cdPadre === null || item.cdPadre === undefined) && filterFn(item));
    const getHijos = () => tablaData.filter(item => item.cdPadre && item.cdPadre !== 0 && item.cdPadre !== null && item.cdPadre !== undefined && filterFn(item));

    return (
        <>
        <FullScreenLoading isVisible={saving} message="Guardando..." />
        <div className="p-6 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">GESTIÓN DE TABLAS</h1>
                        <p className="text-muted-foreground">Administra las tablas del sistema.</p>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4 items-center">
                    {/* Label de advertencia/éxito */}
                    <div className="flex-1 flex items-center">
                        {alertMessage && (
                            <span
                                className={`transition-all text-sm font-semibold px-3 py-2 rounded-lg shadow-sm border ${alertType === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
                                style={{ minWidth: 180 }}
                            >
                                {alertMessage}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="outline"
                            onClick={fetchTablaData}
                            icon="refresh"
                            className="bg-black text-white border-black hover:bg-gray-800"
                        >
                            Actualizar Datos
                        </Button>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por descripción u observación..."
                            className="border border-blue-200 rounded-lg px-3 py-2 text-sm w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                            style={{ minWidth: 320 }}
                        />
                    </div>
                </div>
                {loading ? (
                    <div className="text-center py-8 text-blue-700 font-semibold">Cargando datos...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-600 font-semibold">{error}</div>
                ) : (
                    <table className="min-w-full text-sm rounded-xl overflow-hidden text-black">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="px-4 py-2 text-left font-bold rounded-tl-xl">Codigo Tabla</th>
                                <th className="px-4 py-2 text-left font-bold">Descripcion Tabla</th>
                                <th className="px-4 py-2 text-left font-bold">Obs. Table</th>
                                <th className="px-4 py-2 text-left font-bold">Estado</th>
                                <th className="px-4 py-2 text-center font-bold rounded-tr-xl">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPadres().map(padre => (
                                <React.Fragment key={padre.cdTabla}>
                                    <tr className="transition hover:bg-blue-100/60 group border-b border-blue-100 font-semibold">
                                        <td className="px-4 py-2 align-middle text-black font-bold">{padre.cdTabla}</td>
                                        <td className="px-4 py-2 flex items-center gap-2 align-middle">
                                            <Button size="sm" variant="ghost" onClick={() => toggleExpand(padre.cdTabla)} className="rounded-full border border-blue-200 bg-white shadow hover:bg-blue-100 transition">
                                                <span className="text-lg font-bold">{expanded[padre.cdTabla] ? "−" : "+"}</span>
                                            </Button>
                                            <span className="ml-1">{padre.desTabla}</span>
                                        </td>
                                        <td className="px-4 py-2 align-middle">
                                            <span className="inline-block px-2 py-1 rounded text-xs font-bold" >{padre.obs_Tabla}</span>
                                        </td>
                                        <td className="px-4 py-2 align-middle">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${padre.estado === 'A' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{padre.estado}</span>
                                        </td>
                                        <td className="px-4 py-2 flex gap-2 align-middle justify-center">
                                            <Button size="sm" variant="outline" icon="edit" className="text-white bg-blue-600 border-blue-600 hover:bg-blue-700" onClick={() => handleEdit(padre)}>Editar</Button>
                                            <Button size="sm" variant="destructive" icon="delete" className="hover:bg-red-100" onClick={() => handleDelete(padre)}>Eliminar</Button>
                                            <Button size="sm" variant="outline" icon="plus" className="bg-black text-white border-black hover:bg-gray-800" onClick={() => handleAddChild(padre.cdTabla)}>Agregar Nuevo</Button>
                                        </td>
                                    </tr>
                                    {expanded[padre.cdTabla] && (
                                        <tr className="animate-fade-in">
                                            <td colSpan={5} className="p-0 bg-white">
                                                <div className="pl-8 py-2">
                                                    <table className="w-[95%] mx-auto border border-blue-100 rounded-xl overflow-hidden shadow text-black bg-white">
                                                        <thead>
                                                            <tr className="bg-black text-white">
                                                                <th className="px-3 py-1 text-left font-semibold rounded-tl">Codigo Tabla</th>
                                                                <th className="px-3 py-1 text-left font-semibold">Descripcion</th>
                                                                <th className="px-3 py-1 text-left font-semibold">Codigo Padre</th>
                                                                <th className="px-3 py-1 text-left font-semibold">Obs. Tabla</th>
                                                                <th className="px-3 py-1 text-left font-semibold rounded-tr">Estado</th>
                                                                <th className="px-4 py-2 text-center font-bold rounded-tr-xl">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {getHijos().filter(h => h.cdPadre === padre.cdTabla).map(hijo => (
                                                                <tr key={hijo.cdTabla} className="hover:bg-blue-50 transition">
                                                                    <td className="px-3 py-1 text-black font-bold">{hijo.cdTabla}</td>
                                                                    <td className="px-3 py-1">{hijo.desTabla}</td>
                                                                    <td className="px-3 py-1">{hijo.cdPadre}</td>
                                                                    <td className="px-3 py-1">{hijo.obs_Tabla}</td>
                                                                    <td className="px-3 py-1">
                                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${hijo.estado === 'A' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{hijo.estado}</span>
                                                                    </td>
                                                                    <td className="px-4 py-2 flex gap-2 align-middle justify-center">
                                                                        <Button size="sm" variant="outline" icon="edit" className="hover:bg-blue-50" onClick={() => handleEdit(hijo)}>Editar</Button>
                                                                        <Button size="sm" variant="destructive" icon="delete" className="hover:bg-red-100" onClick={() => handleDelete(hijo)}>Eliminar</Button>
                        
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                        {/* Modal de edición (fuera del mapeo de filas) */}
                        <Modal isOpen={editModalOpen} onClose={handleCloseModal} title="Editar Tabla" size="md">
                            <form className="space-y-4" onSubmit={handleEditSubmit}>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Código Tabla</label>
                                    <input
                                        type="number"
                                        name="cdTabla"
                                        value={editData.cdTabla}
                                        onChange={handleEditInput}
                                        className="w-full border rounded px-3 py-2 text-black"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Descripción Tabla</label>
                                    <input
                                        type="text"
                                        name="desTabla"
                                        value={editData.desTabla}
                                        onChange={handleEditInput}
                                        className="w-full border rounded px-3 py-2 text-black"
                                    />
                                </div>
                                {/* Solo mostrar Código Padre si se está editando un hijo */}
                                {editData.cdPadre !== '' && editData.cdPadre !== null && editData.cdPadre !== undefined && (
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Código Padre</label>
                                        <input
                                            type="number"
                                            name="cdPadre"
                                            value={editData.cdPadre}
                                            onChange={handleEditInput}
                                            className="w-full border rounded px-3 py-2 text-black bg-gray-100 cursor-not-allowed"
                                            disabled={editData.cdPadre === 0}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Observación Tabla</label>
                                    <input
                                        type="text"
                                        name="obs_Tabla"
                                        value={editData.obs_Tabla}
                                        onChange={handleEditInput}
                                        className="w-full border rounded px-3 py-2 text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Estado</label>
                                    <select
                                        name="estado"
                                        value={editData.estado}
                                        onChange={handleEditInput}
                                        className="w-full border rounded px-3 py-2 text-black"
                                    >
                                        <option value="A">Activo </option>
                                        <option value="X">Inactivo</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                                    <Button type="submit" variant="outline" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700" disabled={saving}>Guardar</Button>
                                </div>
                            </form>
                        </Modal>

                        {/* Modal para agregar nuevo hijo */}
                        {/* Modal de confirmación de eliminación */}
                        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmar Eliminación" size="sm">
                            <div className="py-4 text-center">
                                <p className="text-lg mb-4">¿Seguro que deseas eliminar el registro <span className="font-bold text-red-600">{rowToDelete?.cdTabla}</span>?</p>
                                <div className="flex justify-center gap-4">
                                    <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="border-gray-400">Cancelar</Button>
                                    <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 text-white">Eliminar</Button>
                                </div>
                            </div>
                        </Modal>
                        {/* Ya no se usa modal de advertencia, ahora es label arriba */}
                        <Modal isOpen={addChildModalOpen} onClose={handleCloseAddChildModal} title="Agregar Nuevo Hijo" size="md">
                            <form className="space-y-4" onSubmit={handleAddChildSubmit}>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Descripción Tabla</label>
                                    <input
                                        type="text"
                                        name="desTabla"
                                        value={addChildData.desTabla}
                                        onChange={handleAddChildInput}
                                        className={`w-full border rounded px-3 py-2 text-black ${addChildErrors.desTabla ? 'border-red-500' : ''}`}
                                    />
                                    {addChildErrors.desTabla && (
                                        <span className="text-xs text-red-600 mt-1 block">{addChildErrors.desTabla}</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Código Padre</label>
                                    <input
                                        type="number"
                                        name="cdPadre"
                                        value={addChildData.cdPadre}
                                        className="w-full border rounded px-3 py-2 text-black bg-gray-100 cursor-not-allowed"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Observación Tabla</label>
                                    <input
                                        type="text"
                                        name="obs_Tabla"
                                        value={addChildData.obs_Tabla}
                                        onChange={handleAddChildInput}
                                        className="w-full border rounded px-3 py-2 text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Estado</label>
                                    <select
                                        name="estado"
                                        value={addChildData.estado}
                                        onChange={handleAddChildInput}
                                        className={`w-full border rounded px-3 py-2 text-black ${addChildErrors.estado ? 'border-red-500' : ''}`}
                                    >
                                        <option value="A">Activo </option>
                                        <option value="X">Inactivo</option>
                                    </select>
                                    {addChildErrors.estado && (
                                        <span className="text-xs text-red-600 mt-1 block">{addChildErrors.estado}</span>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={handleCloseAddChildModal}>Cancelar</Button>
                                    <Button type="submit" variant="outline" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700" disabled={saving}>Guardar</Button>
                                </div>
                            </form>
                        </Modal>
                    </table>
                )}
            </div>
        </div>
    </>
    );
}

export default Tabla;