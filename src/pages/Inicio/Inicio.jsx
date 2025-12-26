import React from "react";
import { useLocation } from "react-router-dom";

function Inicio() {
  const location = useLocation();
  const user = location.state?.user;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Bienvenido, {user?.name || user?.usuario || "Usuario"}!
      </h2>
      <p>Esta es la vista principal de la aplicación.</p>
      {/* Aquí puedes agregar más contenido */}
    </div>
  );
}

export default Inicio;
