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
export async function GrabarVehiculo(vehiculo) {
  const url = `${API_URL}/api/Vehiculo/Grabar`;
  console.log("POST:", url, vehiculo);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.post(url, vehiculo, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al grabar vehículo.");
  }
}
export async function EliminarVehiculo(Nro_Placa) {
  const url = `${API_URL}/api/Vehiculo/Eliminar/${Nro_Placa}`;
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
    handleAxiosError(err, "Error al eliminar vehículo.");
  }
}

export async function RecuperarVehiculo(Nro_Placa) {
  const url = `${API_URL}/api/Vehiculo/Recuperar/${Nro_Placa}`;
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
    handleAxiosError(err, "Error al recuperar vehículo.");
  }
}
export async function ExisteVehiculo(Nro_Placa) {
  const url = `${API_URL}/api/Vehiculo/Existe/${Nro_Placa}`;
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
    handleAxiosError(err, "Error al verificar existencia de vehículo.");
  }
}
export async function ListarVehiculo(vehiculo) {
  const url = `${API_URL}/api/Vehiculo/Listar/${vehiculo.Nro_Placa || "*"}/${vehiculo.IDProveedor || "*"}/${vehiculo.Año || 0}/${vehiculo.Nro_Ejes || 0}/${vehiculo.Estado || "*"}/${vehiculo.Tipo_Unidad || "*"}`;
  console.log("get:", url, vehiculo);
  // Verifica que haya sesión activa
  if (!getjwtToken()) {
    console.error("No hay sesión activa.");
    throw new Error("No hay sesión activa.");
  }
  try {
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Error al listar vehículo.");
  }
}
