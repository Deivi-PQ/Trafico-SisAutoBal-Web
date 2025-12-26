import axios from "axios";
import { API_URL } from "../../../cofig";

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

export async function GrabarBalanza(balanza) {
  const url = `${API_URL}/api/Balanza/Grabar`;
  console.log("POST:", url, balanza);
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.post(url, balanza, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al grabar Balanza.");
  }
}

export async function EliminarBalanza(id) {
  const url = `${API_URL}/api/Balanza/Eliminar/${id}`;
  console.log("DELETE:", url);
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.delete(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al eliminar Balanza.");
  }
}

export async function RecuperarBalanza(id) {
  const url = `${API_URL}/api/Balanza/Recuperar/${id}`;
  console.log("GET:", url);
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al recuperar Balanza.");
  }
}

export async function ListarBalanza(filtro) {
  // filtro: { Des_Balanza, Tipo, Estado, SN_Contr }
  const Des_Balanza = encodeURIComponent(filtro.Des_Balanza || "*");
  const Tipo = encodeURIComponent(filtro.Tipo || "*");
  const Estado = encodeURIComponent(filtro.Estado || "*");
  const SN_Contr = encodeURIComponent(filtro.SN_Contr || "*");
  const url = `${API_URL}/api/Balanza/Listar/${Des_Balanza}/${Tipo}/${Estado}/${SN_Contr}`;
  console.log("GET:", url, filtro);
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al listar Balanza.");
  }
}
