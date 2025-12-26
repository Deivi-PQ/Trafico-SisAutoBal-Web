import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderBar from "../navigation/HeaderBar";
import SideBar from "../navigation/SideBar";

const NewBaseLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHeaderMenu, setActiveHeaderMenu] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleHeaderMenuChange = (menu) => {
    setActiveHeaderMenu(menu);
    // NO auto-abrir sidebar - solo se controla con el botón hamburguesa
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <HeaderBar
        activeHeaderMenu={activeHeaderMenu}
        onHeaderMenuChange={handleHeaderMenuChange}
        onMenuToggle={toggleSidebar}
        menuOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <SideBar
        activeHeaderMenu={activeHeaderMenu}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Contenido principal */}
      <main
        className={`transition-all duration-300 ease-in-out pt-20 md:pt-24 ${
          sidebarOpen ? 'md:ml-72 lg:ml-80' : ''
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Espaciado adicional en móvil cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 pointer-events-none" />
      )}
    </div>
  );
};

export default NewBaseLayout;
