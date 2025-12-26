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

export async function GrabarAcceso(oAcceso) {
  const url = `${API_URL}/api/Acceso/Grabar`;
  console.log("POST:", url, oAcceso);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.post(url, oAcceso, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al grabar acceso.");
  }
}

export async function EliminarAcceso(Cod_Acceso) {
  const url = `${API_URL}/api/Acceso/Eliminar/${Cod_Acceso}`;
  console.log("GET:", url);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al eliminar acceso.");
  }
}
export async function RecuperarAcceso(Cod_Acceso) {
  const url = `${API_URL}/api/Acceso/Recuperar/${Cod_Acceso}`;
  console.log("GET:", url);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al recuperar acceso.");
  }
}

export async function ExisteAcceso(Cod_Acceso) {
  const url = `${API_URL}api/Acceso/Existe/${Cod_Acceso}`;
  console.log("GET:", url);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al verificar existencia de acceso.");
  }
}

export async function ListarAcceso(Filtro) {
  const url = `${API_URL}/api/Acceso/Listar`;
  console.log("Post:", url, Filtro);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.post(url, Filtro, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al listar acceso.");
  }
}
