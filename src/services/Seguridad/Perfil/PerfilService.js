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

export async function GrabarPerfil(oPerfil) {
  const url = `${API_URL}/api/Perfil/Grabar`;
  console.log("POST:", url, oPerfil);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.post(url, oPerfil, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, `Error al grabar perfil ${url}.`);
  }
}
export async function EliminarPerfil(IDPerfil) {
  const url = `${API_URL}/api/Perfil/Eliminar/${IDPerfil}`;
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
    handleAxiosError(err, `Error al eliminar perfil ${url}.`);
  }
}
export async function RecuperarPerfil(IDPerfil) {
  const url = `${API_URL}/api/Perfil/Recuperar/${IDPerfil}`;
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
    handleAxiosError(err, `Error al recuperar perfil ${url}.`);
  }
}
export async function ExistePerfil(IDPerfil) {
  const url = `${API_URL}/api/Perfil/Existe/${IDPerfil}`;
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
    handleAxiosError(err, `Error al verificar existencia de perfil ${url}.`);
  }
}
export async function ListarPerfil(filtro) {
  const url = `${API_URL}/api/Perfil/Listar`;
  console.log("POST:", url, filtro);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.post(url, filtro, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, `Error al listar perfil ${url}.`);
  }
}
