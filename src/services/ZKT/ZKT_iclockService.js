import axios from "axios";
import { API_URL } from "../../cofig";
// Nota: no se importa el componente de UI aquí (evitar import no usado)

function getjwtToken() {
    return localStorage.getItem("jwtToken");
}

function authHeader() {
    const token = getjwtToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleAxiosError(err, defaultMsg) {
    if (axios.isAxiosError ? axios.isAxiosError(err) : isAxiosErrorShallow(err)) {
        if (err.response) {
            const msg = extractMessage(err.response.data) || defaultMsg;
            throw new Error(msg);
        } else if (err.request) {
            throw new Error("No se recibió respuesta del backend.");
        } else {
            throw new Error(err.message || defaultMsg);
        }
    }
    throw new Error(defaultMsg);
}

function isAxiosErrorShallow(err) {
    return !!err && typeof err === "object" && "isAxiosError" in err;
}

function extractMessage(data) {
    if (!data) return;
    if (typeof data === "string") return data;
    if (typeof data === "object") {
        if (typeof data.message === "string") return data.message;
        if (typeof data.error === "string") return data.error;
    }
    try { return JSON.stringify(data); } catch { return; }
}

export async function AperturaBarrera(SNContr, Accion) {
    try {
        const accion = (Accion || "").toString().trim().toLowerCase();

        let ComandoAp = "";
        if (accion === "open") {
            ComandoAp = "C:221:CONTROL DEVICE 01010101";
        } else if (accion === "close") {
            ComandoAp = "C:221:CONTROL DEVICE 01020101";
        } else {
            throw new Error("Accion inválida para AperturaBarrera");
        }

        // Endpoint del backend (se mantiene formato usado en este servicio)
        const url = `${API_URL}/iclock/comando?SN=${encodeURIComponent(SNContr)}&Comando=${encodeURIComponent(ComandoAp)}`;
        const headers = authHeader();
        const response = await axios.post(url, null, { headers });

        if (response && response.status >= 200 && response.status < 300) {
            return typeof response.data === "string" ? response.data : JSON.stringify(response.data);
        }
        return "";
    } catch (err) {
        handleAxiosError(err, "Error enviando comando a la controladora");
    }
}