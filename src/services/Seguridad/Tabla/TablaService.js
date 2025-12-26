import axios from "axios";
import { API_URL } from "../../../cofig";

export async function GrabarT(oTabla) {
  const url = `${API_URL}api/Tabla/Grabar`;
  console.log("POST:", url, oTabla);
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const { data } = await axios.post(url, oTabla, { headers: authHeader() });
    return data;
  } catch (err) {
    handleAxiosError(err, "Error al guardar tabla.");
  }
}

export async function EliminarT(CdTabla) {
  const url = `${API_URL}api/Tabla/Eliminar/${CdTabla}`;
  console.log("GET:", url);
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const { data } = await axios.get(url, {
      headers: authHeader()
    });
    return data;
  } catch (err) {
    handleAxiosError(err, "Error al eliminar tabla.");
  }
}

export async function RecuperarT(CdTabla) {
  const url = `${API_URL}api/Tabla/Recuperar/${CdTabla}`;
  console.log("GET:", url);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const { data } = await axios.get(url, {
      headers: authHeader()
    });
    return data;
  } catch (err) {
    handleAxiosError(err, "Error al recuperar tabla.");
  }
}
export async function ExisteT(CdTabla) {
  const url = `${API_URL}api/Tabla/Existe/${CdTabla}`;
  console.log("GET:", url);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const { data } = await axios.get(url, {
      headers: authHeader()
    });
    return data;
  } catch (err) {
    handleAxiosError(err, "Error al verificar existencia de la tabla.");
  }
}

export async function ListarT(DesTabla) {
  const url = `${API_URL}api/Tabla/Listar/${DesTabla}`;
  console.log("GET:", url);
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const { data } = await axios.get(url, {
      headers: authHeader()
    });
    return data;
  } catch (err) {
    handleAxiosError(err, "Error al listar tablas.");
  }
}

export async function RecuperHijoT(IcPadre) {
  const url = `${API_URL}api/Tabla/RecuperarHijo/${IcPadre}`;
  console.log("GET:", url);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const { data } = await axios.get(url, {
      headers: authHeader()
    });
    return data;
  } catch (err) {
    handleAxiosError(err, "Error al listar tablas.");
  }
}

//----
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
