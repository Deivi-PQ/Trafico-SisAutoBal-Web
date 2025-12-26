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


export async function GrabarTag_RFID(tag_rfid) {
  const url = `${API_URL}/api/Tag_RFID/Grabar`;
  console.log("POST:", url, tag_rfid);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.post(url, tag_rfid, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al grabar Tag_RFID.");
  }
}

export async function EliminarTag_RFID(codtag_rfid) {
  const url = `${API_URL}/api/Tag_RFID/Eliminar/${codtag_rfid}`;
  console.log("GET:", url);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.delete(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al eliminar Tag_RFID.");
  }
}

export async function RecuperarTag_RFID(codtag_rfid) {
  const url = `${API_URL}/api/Tag_RFID/Recuperar/${codtag_rfid}`;
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
    handleAxiosError(err, "Error al recuperar Tag_RFID.");
  }
}

export async function ListarTag_RFID(filtro) {
  const url = `${API_URL}/api/Tag_RFID/Listar/${filtro.Cod_RFID || "*"}/${filtro.Nro_Placa || "*"}`;
  console.log("GET:", url, filtro);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al listar Tag_RFID.");
  }
}

export async function ExisteTag_RFID(codtag_rfid) {
  const url = `${API_URL}/api/Tag_RFID/Existe/${codtag_rfid}`;
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
    handleAxiosError(err, "Error al verificar existencia de Tag_RFID.");
  }
}
