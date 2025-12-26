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

export async function ListarPesos(filtro) {
  // filtro: { IDBalanza, ID, Nro_Placa, fecha_Ini, fecha_Fin }
  const IDBalanza = encodeURIComponent(filtro.IDBalanza || "*");
  const ID = filtro.ID != null ? encodeURIComponent(String(filtro.ID)) : "*";
  const Nro_Placa = encodeURIComponent(filtro.Nro_Placa || "*");
  const fecha_Ini = filtro.fecha_Ini ? encodeURIComponent(new Date(filtro.fecha_Ini).toISOString()) : "*";
  const fecha_Fin = filtro.fecha_Fin ? encodeURIComponent(new Date(filtro.fecha_Fin).toISOString()) : "*";
  const url = `${API_URL}/api/PesoBalanza/Listar/${IDBalanza}/${ID}/${Nro_Placa}/${fecha_Ini}/${fecha_Fin}/${filtro.page_Number || 1}/${filtro.page_Size || 10}`;
  console.log("GET:", url, filtro);
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al listar Pesos Balanza.");
  }
}

export async function FiltrarPesoBalanza(fecha_Ini, fecha_Fin, Nro_Placa) {
  const url = `${API_URL}api/PesoBalanza/Listar/${fecha_Ini}/${fecha_Fin}/${Nro_Placa}`;
  console.log("GET:", url);
  if (!getjwtToken()) {
    console.error("No se encontró el token JWT.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al generar el reporte detallado de batches.");
  }
}
export async function GenerarReporte(fecha_Ini, fecha_Fin, Nro_Placa, Tipo) {
  const url = `${API_URL}api/Reporte/Reporte_PesoBalanza/${fecha_Ini}/${fecha_Fin}/${Nro_Placa}/${Tipo}`;
  console.log("GET:", url);
  if (!getjwtToken()) {
    console.error("No se encontró el token JWT.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al generar el reporte.");
  }
}
