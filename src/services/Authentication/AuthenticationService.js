import axios from "axios";
import { API_URL } from "../../cofig";


export async function Contrasena_Correcta(Model) {
    const url = `${API_URL}/Authentication/Contrasena_Correcta`;
    console.log("POST:", url, Model);
    try {
        const { data } = await axios.post(url, Model);
        const { jwtToken, refreshToken, usuario } = data;
        if (jwtToken) localStorage.setItem("jwtToken", jwtToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("usuario", usuario);
        if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
        return data;
    } catch (err) {
        handleAxiosError(err, "Error de autenticación.");
    }
}

export async function Cambiar_Contrasena(Model) {
    const url = `${API_URL}/Authentication/Cambiar_Contrasena`;
    console.log("POST:", url, Model);
    try {
        const { data } = await axios.post(url, Model);
        const { jwtToken, refreshToken, usuario } = data;
        if (jwtToken) localStorage.setItem("jwtToken", jwtToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("usuario", usuario);
        if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
        return data;
    } catch (err) {
        handleAxiosError(err, "Error de autenticación.");
    }
}

export async function Login(Model) {
    const url = `${API_URL}/Authentication/Login`;
    console.log("POST:", url, Model);
    try {
        const { data } = await axios.post(url, Model);
        const { jwtToken, refreshToken, usuario } = data;
        if (jwtToken) localStorage.setItem("jwtToken", jwtToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("usuario", usuario);
        if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
        return data;
    } catch (err) {
        handleAxiosError(err, "Error de autenticación.");
    }
}

export async function Refresh_Token() {
    const token = localStorage.getItem("refreshToken");
    const usuario = localStorage.getItem("usuario");
    if (!token || !usuario) {
        throw new Error("No refresh token.");
    }

    try {
        const { data } = await axios.post(`${API_URL}/refresh`, {
            usuario,
            refreshToken: token,
        });

        const { jwtToken } = data;
        if (jwtToken) localStorage.setItem("jwtToken", jwtToken);
        return jwtToken;
    } catch (err) {
        handleAxiosError(err, "Error al refrescar token.");
    }
}

function handleAxiosError(err, defaultMsg) {

    if (axios.isAxiosError ? axios.isAxiosError(err) : isAxiosErrorShallow(err)) {
        if (err.response) {
            console.error("Backend error:", err.response.status, err.response.data);
            const msg = extractMessage(err.response.data) || defaultMsg;
            throw new Error(msg);
        } else if (err.request) {
            console.error("No response from backend:", err.request);
            throw new Error("No se recibió respuesta del backend.");
        } else {
            console.error("Axios config error:", err.message);
            throw new Error(err.message || defaultMsg);
        }
    }
    // Error no-axios
    console.error("Unknown error:", err);
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
        // Backend tipo { errors: [...] } o { error: "..." }
        if (typeof data.error === "string") return data.error;
    }
    try {
        return JSON.stringify(data);
    } catch {
        return;
    }
}