import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import NewBaseLayout from "./Components/navigation/NewBaseLayout.jsx";
import Inicio from "./pages/Inicio/Inicio.jsx";
import Usuario from "./pages/Seguridad/Usuario/Usuario.jsx";
import Perfil_Usuario from "./pages/Seguridad/Perfil/Perfil_Usuario.jsx";
import Acceso from "./pages/Seguridad/Acceso/Acceso.jsx";
import Personal from "./pages/Global/Personal/Personal.jsx";
import Tag_RFID from "./pages/AutoBal/Tag_RFID/Tag_RFID.jsx";
import Tabla from "./pages/Seguridad/Tabla/Tabla.jsx";
import Vehiculo from "./pages/Global/Vehiculo/Vehiculo.jsx";
import Balanza from "./pages/Transporte/Balanza/Balanza.jsx";
import PesoBalanzaTab from "./pages/Transporte/PesoBalanza/PesoBalanzaTab.jsx";
import AperturaBarreara from "./pages/AutoBal/AperturaBarrera/AperturaBarreara.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/*" element={<NewBaseLayout />}>
        <Route path="inicio" element={<Inicio />} />
        <Route path="usuario" element={<Usuario />} />
        <Route path="perfil" element={<Perfil_Usuario />} />
        <Route path="acceso" element={<Acceso />} />
        <Route path="persona" element={<Personal />} />
        <Route path="tag_rfid" element={<Tag_RFID />} />
        <Route path="tabla" element={<Tabla />} />
        <Route path="vehiculo" element={<Vehiculo />} />
        <Route path="balanza" element={<Balanza />} />
        <Route path="pesobalanza" element={<PesoBalanzaTab />} />
        <Route path="aperturabarrera" element={<AperturaBarreara />} />
      </Route>
    </Routes>
  );
}

export default App;
