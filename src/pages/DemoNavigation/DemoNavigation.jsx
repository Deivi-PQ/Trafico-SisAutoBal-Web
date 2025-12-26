import React, { useEffect, useState } from "react";

const DemoNavigation = () => {
  const [menuData, setMenuData] = useState([]);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    // Obtener datos desde localStorage para mostrar la estructura
    const menus = JSON.parse(localStorage.getItem("listMenu") || "[]");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    setMenuData(menus);
    setUserData(user);
  }, []);

  // Filtrar menús por nivel para la demostración
  const nivel0Menus = menuData.filter(menu => menu.nivel === 0);
  const nivel1Menus = menuData.filter(menu => menu.nivel === 1);
  const otherMenus = menuData.filter(menu => menu.nivel > 1);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Navegación</h1>
        <p className="text-gray-600">
          Nuevo sistema con HeaderBar y SideBar basado en la jerarquía de menús
        </p>
      </div>

      {/* Información del usuario */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Usuario Actual</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre:</label>
            <p className="text-gray-900">{userData?.nombre_Usuario || "No disponible"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Código:</label>
            <p className="text-gray-900">{userData?.codUsuario || "No disponible"}</p>
          </div>
        </div>
      </div>

      {/* Estructura de menús */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* HeaderBar Menus (Nivel 0) */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-blue-800">HeaderBar</h3>
          </div>
          <p className="text-sm text-blue-600 mb-4">
            Menús de Nivel 0 (códigos terminados en 0000)
          </p>
          <div className="space-y-2">
            {nivel0Menus.length > 0 ? (
              nivel0Menus.map((menu) => (
                <div
                  key={menu.cod_Acceso}
                  className="bg-white rounded p-3 border border-blue-100"
                >
                  <div className="font-medium text-gray-800">
                    {menu.nombre_Acceso}
                  </div>
                  <div className="text-xs text-gray-500">
                    Código: {menu.cod_Acceso} | Nivel: {menu.nivel}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                No hay menús de nivel 0
              </p>
            )}
          </div>
        </div>

        {/* SideBar Menus (Nivel 1+) */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-green-800">SideBar</h3>
          </div>
          <p className="text-sm text-green-600 mb-4">
            Menús de Nivel 1+ (hijos de HeaderBar)
          </p>
          <div className="space-y-2">
            {nivel1Menus.length > 0 ? (
              nivel1Menus.slice(0, 5).map((menu) => (
                <div
                  key={menu.cod_Acceso}
                  className="bg-white rounded p-3 border border-green-100"
                >
                  <div className="font-medium text-gray-800">
                    {menu.nombre_Acceso}
                  </div>
                  <div className="text-xs text-gray-500">
                    Código: {menu.cod_Acceso} | Nivel: {menu.nivel}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                No hay menús de nivel 1
              </p>
            )}
            {nivel1Menus.length > 5 && (
              <p className="text-xs text-gray-500">
                ... y {nivel1Menus.length - 5} más
              </p>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-purple-800">Información</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Estadísticas</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Total menús: {menuData.length}</p>
                <p>Nivel 0: {nivel0Menus.length}</p>
                <p>Nivel 1: {nivel1Menus.length}</p>
                <p>Otros niveles: {otherMenus.length}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Funcionalidad</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✅ HeaderBar responsive</p>
                <p>✅ SideBar jerárquico</p>
                <p>✅ Auto-expansión</p>
                <p>✅ Navegación móvil</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mt-8 bg-gray-50 rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Cómo usar el nuevo sistema</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">HeaderBar</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Muestra menús de nivel 0 horizontalmente</li>
              <li>• Códigos que terminan en 0000</li>
              <li>• Al hacer clic, se activa y muestra sus hijos en SideBar</li>
              <li>• Incluye dropdown de usuario y logout</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">SideBar</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Muestra hijos del menú activo del HeaderBar</li>
              <li>• Estructura jerárquica con expansión/colapso</li>
              <li>• Se oculta/muestra con botón hamburguesa</li>
              <li>• Responsive para móvil con overlay</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoNavigation;
