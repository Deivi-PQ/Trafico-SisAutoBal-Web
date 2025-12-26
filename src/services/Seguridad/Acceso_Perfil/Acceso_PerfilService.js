import axios from "axios";
import { API_URL } from "../../../config";

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
export async function GrabarAcceso_Perfil(oAcceso_Perfil) {
  const url = `${API_URL}api/Acceso_Perfil/Grabar`;
  console.log("POST:", url, oAcceso_Perfil);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.post(url, oAcceso_Perfil, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al grabar acceso perfil.");
  }
}
export async function EliminarAcceso_Perfil(Cod_Acceso, IDPerfil) {
  const url = `${API_URL}api/Acceso_Perfil/Eliminar/${Cod_Acceso}/${IDPerfil}`;
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
    handleAxiosError(err, "Error al eliminar acceso perfil.");
  }
}
export async function RecuperarAcceso_Perfil(Cod_Acceso, IDPerfil) {
  const url = `${API_URL}api/Acceso_Perfil/Recuperar/${Cod_Acceso}/${IDPerfil}`;
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
    handleAxiosError(err, "Error al recuperar acceso perfil.");
  }
}

export async function ExisteAcceso_Perfil(Cod_Acceso, IDPerfil) {
  const url = `${API_URL}api/Acceso_Perfil/Existe/${Cod_Acceso}/${IDPerfil}`;
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
    handleAxiosError(err, "Error al verificar existencia de acceso perfil.");
  }
}
export async function ListarAcceso_Perfil() {
  const url = `${API_URL}api/Acceso_Perfil/Listar`;
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
    handleAxiosError(err, "Error al listar acceso perfil.");
  }
}
