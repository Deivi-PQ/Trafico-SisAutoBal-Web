import React, { useState, useEffect } from "react";
import { ListarBalanza } from "../../../services/Transporte/Balanza/BalanzaService";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { FullScreenLoading } from "../../../Components/ui/full-screen-loading";
import { Unlock, Lock, AlertTriangle } from "lucide-react";
import { AperturaBarrera } from "../../../services/ZKT/ZKT_iclockService";
import { useToast } from "../../../Components/ui/toast"; 

const AperturaBarreara = () => {
    const [balanzas, setBalanzas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmEnabled, setConfirmEnabled] = useState(false);

    const showToast = useToast();
    const showErrorToast = (m) => showToast(m, "error");
    const showSuccessToast = (m) => showToast(m, "success");

    const loadBalanzas = async () => {
        setLoading(true);
        try {
            const data = await ListarBalanza(
                {
                    Des_Balanza: "*",
                    Tipo: "*",
                    Estado: "T",
                    SN_Contr: "*",
                }
            );
            setBalanzas(Array.isArray(data) ? data : []);
            showSuccessToast("Balanzas cargadas correctamente.");
        } catch (e) {
            showErrorToast(e?.message || "Error al cargar balanzas.");
            setBalanzas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBalanzas();
    }, []);

    const handleEstadoBarrera = async (b, E) => {
        // preparamos el comando de apertura de barrera
        try {
            const SN = b.SN_Contr || b.sN_Contr;
            const Estado = await AperturaBarrera(SN, E);
            if (Estado) {
                showSuccessToast(E === "OPEN" ? "Apertura realizada correctamente." : "Cierre realizado correctamente.");
            } else {
                showErrorToast("nose recibió respuesta del backend.");
            }
        } catch (e) {
            showErrorToast(e?.message || "Error al enviar comando a la balanza.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <FullScreenLoading isVisible={loading} message="Cargando..." />
                <div>
                    <h1 className="text-2xl font-bold">GESTIÓN DE APERTURA DE BARRERA VEHICULAR</h1>
                    <p className="text-muted-foreground">Administrar la apertura y cierre de barreras vehiculares conectadas a las balanzas.</p>
                    <div className="mt-3">
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 mt-0.5" />
                            <span className="text-sm">Precaución: Las operaciones de apertura y cierre de barreras requieren confirmación. Active el checkbox de cada fila para habilitar los botones. Verifique que el área esté despejada antes de activar la barrera.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
                <div className="bg-card border border-border rounded-lg mt-4">
                    {loading ? (
                        <div className="p-8 text-center">Cargando balanzas...</div>
                    ) : (
                        <div>
                            <div className="px-6 py-4 border-b border-border">
                                <h3 className="text-lg font-semibold">Balanzas ({balanzas.length})</h3>
                                {error && (
                                    <div className="text-sm text-red-600 mt-2">{error}</div>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Descripción</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">SN Controladora</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Estado</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span>Acciones</span>
                                                    <label className="flex items-center gap-1 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={confirmEnabled}
                                                            onChange={(e) => setConfirmEnabled(e.target.checked)}
                                                            className="w-4 h-4 cursor-pointer"
                                                            aria-label="Habilitar/Deshabilitar operaciones de barrera"
                                                            title="Marcar para habilitar los botones de apertura y cierre"
                                                        />
                                                        <span className="text-xs text-gray-600">Activar</span>
                                                    </label>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-border">
                                        {balanzas.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-gray-500">No se encontraron Balanzas</td>
                                            </tr>
                                        ) : (
                                            balanzas.map((b) => {
                                                const id = b.IDBalanza ?? b.idBalanza;
                                                return (
                                                    <tr key={id} className={id % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{b.Des_Balanza ?? b.des_Balanza}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{b.SN_Contr ?? b.sN_Contr}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${(b.Estado ?? b.estado) === "A" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                                {(b.Estado ?? b.estado) === "A" ? "Activo" : "Inactivo"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-2">
                                                                <Button 
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                    size="sm" 
                                                                    onClick={() => handleEstadoBarrera(b, 'OPEN')} 
                                                                    disabled={!confirmEnabled}
                                                                    aria-label={`Apertura Barrera vehicular`}><Unlock className="w-4 h-4 mr-2" />Apertura</Button>
                                                                <Button 
                                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                                    size="sm" 
                                                                    onClick={() => handleEstadoBarrera(b, 'CLOSE')} 
                                                                    disabled={!confirmEnabled}
                                                                    aria-label={`Cierre Barrera vehicular`}><Lock className="w-4 h-4 mr-2" />Cierre</Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AperturaBarreara;