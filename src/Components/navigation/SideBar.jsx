import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const SideBar = ({ activeHeaderMenu, isOpen, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const navigate = useNavigate();

  // Obtener menús desde localStorage
  const menus = JSON.parse(localStorage.getItem("menus") || "[]");

  // Función para obtener los hijos directos de un menú
  const getDirectChildren = (parentCodAcceso) => {
    if (!parentCodAcceso) return [];

    const parentStr = String(parentCodAcceso);
    const parentLevel =
      menus.find((m) => m.cod_Acceso === parentCodAcceso)?.nivel || 0;

    console.log(
      `Getting children for parent: ${parentCodAcceso} (level ${parentLevel})`
    );

    const children = menus.filter((menu) => {
      const codStr = String(menu.cod_Acceso);

      // Verificar que el código empiece con el del padre y sea más largo
      const isCodeChild =
        codStr.startsWith(parentStr) &&
        codStr.length > parentStr.length &&
        menu.cod_Acceso !== parentCodAcceso;

      if (!isCodeChild) return false;

      // Los hijos directos son aquellos que tienen el nivel inmediatamente superior
      // al padre Y no tienen un padre intermedio en la jerarquía
      const isDirectChild =
        menu.nivel > parentLevel &&
        !menus.some((intermediate) => {
          const intStr = String(intermediate.cod_Acceso);
          return (
            intermediate.nivel > parentLevel &&
            intermediate.nivel < menu.nivel &&
            intStr.startsWith(parentStr) &&
            codStr.startsWith(intStr) &&
            intermediate.cod_Acceso !== parentCodAcceso
          );
        });

      return isDirectChild;
    });

    console.log(`Children found for ${parentCodAcceso}:`, children);
    return children;
  };

  // Función alternativa más simple para obtener hijos directos
  const getDirectChildrenSimple = (parentCodAcceso) => {
    if (!parentCodAcceso) return [];

    // Verificar si el padre puede tener hijos (comando vacío o null)
    const parentMenu = menus.find((m) => m.cod_Acceso === parentCodAcceso);
    if (!parentMenu) return [];

    // Si el padre tiene comando, no puede tener hijos
    if (parentMenu.comando && parentMenu.comando.trim() !== "") {
      return [];
    }

    // Convertir a string y manejar tanto números como strings
    const parentStr = String(parentCodAcceso).trim();
    const parentNum = parseInt(parentCodAcceso);

    // Buscar todos los menús que empiecen con el código del padre
    const potentialChildren = menus.filter((menu) => {
      const codStr = String(menu.cod_Acceso).trim();
      const codNum = parseInt(menu.cod_Acceso);

      // Verificar diferentes condiciones:
      // 1. Código como string empieza con padre
      const startsWithStr =
        codStr.startsWith(parentStr) && codStr.length > parentStr.length;

      // 2. Código como número está en rango (ej: 10000 -> 10100-10999)
      const inNumRange =
        !isNaN(parentNum) &&
        !isNaN(codNum) &&
        codNum > parentNum &&
        codNum < parentNum + 1000; // rango flexible

      // 3. Diferencia exacta (ej: 10000 -> 10100, 10200)
      const exactPattern =
        !isNaN(parentNum) &&
        !isNaN(codNum) &&
        (codNum - parentNum) % 100 === 0 &&
        codNum > parentNum &&
        codNum < parentNum + 1000;

      const isChild = startsWithStr || inNumRange || exactPattern;

      return isChild && menu.cod_Acceso !== parentCodAcceso;
    });

    // De estos, tomar solo los que no tengan un padre intermedio
    const directChildren = potentialChildren.filter((child) => {
      const childStr = String(child.cod_Acceso);
      const childNum = parseInt(child.cod_Acceso);

      // Verificar si hay algún otro menú que sea padre de este hijo
      const hasIntermediateParent = potentialChildren.some((potential) => {
        const potentialStr = String(potential.cod_Acceso);
        const potentialNum = parseInt(potential.cod_Acceso);

        // Solo considerar como padre intermedio si ese menú NO tiene comando
        const potentialMenu = menus.find(
          (m) => m.cod_Acceso === potential.cod_Acceso
        );
        const canBeParent =
          !potentialMenu.comando || potentialMenu.comando.trim() === "";

        return (
          potential.cod_Acceso !== child.cod_Acceso &&
          canBeParent &&
          ((potentialStr.length < childStr.length &&
            childStr.startsWith(potentialStr)) ||
            (!isNaN(potentialNum) &&
              !isNaN(childNum) &&
              potentialNum < childNum &&
              childNum < potentialNum + 100))
        );
      });

      return !hasIntermediateParent;
    });

    return directChildren;
  };

  // Función recursiva para construir el árbol de menús
  const buildMenuTree = (parentCodAcceso = null) => {
    let baseMenus = [];

    if (activeHeaderMenu) {
      // Si hay un menú activo en el header, buscar sus hijos directos
      baseMenus = getDirectChildrenSimple(activeHeaderMenu.cod_Acceso);
    } else {
      // Si no hay menú activo, mostrar todos los menús de nivel 1
      baseMenus = menus.filter((menu) => menu.nivel === 1);
    }

    return baseMenus.map((menu) => ({
      ...menu,
      children: getDirectChildrenSimple(menu.cod_Acceso),
    }));
  };

  const menuTree = useMemo(() => buildMenuTree(), [activeHeaderMenu, menus]);

  const toggleExpanded = (codAcceso) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(codAcceso)) {
        newSet.delete(codAcceso);
      } else {
        newSet.add(codAcceso);
      }
      return newSet;
    });
  };

  const handleMenuClick = (menu) => {
    // Solo puede expandir/contraer si no tiene comando y tiene hijos
    const canHaveChildren = !menu.comando || menu.comando.trim() === "";
    const hasChildren =
      canHaveChildren && menu.children && menu.children.length > 0;

    if (hasChildren) {
      toggleExpanded(menu.cod_Acceso);
    }

    // Si tiene comando o ruta, navegar
    if (menu.comando || menu.ruta) {
      const targetRoute = menu.comando || menu.ruta;
      navigate(targetRoute);
      // En móvil, cerrar sidebar después de navegar
      if (window.innerWidth < 768) {
        onToggle();
      }
    }
  };

  const renderMenuItem = (menu, level = 1) => {
    // Solo puede tener hijos si no tiene comando (o comando está vacío)
    const canHaveChildren = !menu.comando || menu.comando.trim() === "";
    const hasChildren =
      canHaveChildren && menu.children && menu.children.length > 0;
    const isExpanded = expandedItems.has(menu.cod_Acceso);
    const paddingLeft = `${level * 16 + 12}px`;
    const hasCommand = menu.comando && menu.comando.trim() !== "";

    return (
      <div key={menu.cod_Acceso} className="w-full menu-item-enter">
        <button
          onClick={() => handleMenuClick(menu)}
          className={`sidebar-button w-full flex items-center justify-between px-3 py-2.5 text-left transition-all duration-200 ease-out group relative rounded-lg mx-2 my-0.5 menu-item-hover ${
            level > 1 ? "text-sm" : "font-medium text-sm"
          } ${
            hasCommand
              ? "hover:bg-blue-50 hover:text-[#003E83]"
              : "hover:bg-slate-50 hover:text-slate-900"
          }`}
          style={{ paddingLeft }}
        >
          <div className="flex items-center gap-3 relative z-10">
            {menu.imagen ? (
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 flex-shrink-0">
                <img src={menu.imagen} alt="" className="w-4 h-4" />
              </div>
            ) : (
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-lg border flex-shrink-0 ${
                  level === 1
                    ? "bg-gradient-to-br from-[#003E83] to-[#002550] border-[#004b9e] shadow-sm"
                    : level === 2
                    ? "bg-gradient-to-br from-[#025a82] to-[#014464] border-[#016b9b]"
                    : "bg-gradient-to-br from-[#3a2d7c] to-[#2a1f5c] border-[#463791]"
                }`}
              >
                <div className="w-2 h-2 bg-white rounded-full opacity-80" />
              </div>
            )}

            <span
              className={`font-medium transition-colors ${
                hasCommand
                  ? "text-slate-700 group-hover:text-[#003E83]"
                  : "text-slate-600 group-hover:text-slate-900"
              }`}
            >
              {menu.nombre_Acceso}
            </span>
          </div>

          {/* Icono de expansión mejorado */}
          {hasChildren && (
            <div className="relative z-10">
              <svg
                className={`expand-icon w-4 h-4 text-slate-400 group-hover:text-slate-600 ${
                  isExpanded ? "rotate-90" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </button>

        {/* Contenedor de hijos mejorado */}
        {hasChildren && isExpanded && (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-transparent"></div>
            <div className="ml-3 space-y-0.5">
              {menu.children.map((child) =>
                renderMenuItem(
                  {
                    ...child,
                    children: getDirectChildrenSimple(child.cod_Acceso),
                  },
                  level + 1
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay mejorado para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl border-r border-slate-200/60 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-80 md:w-72 lg:w-80`}
      >
        {/* Header del sidebar mejorado */}
        <div className="sidebar-header px-4 py-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                <img
                  src="/Logo.png"
                  alt="Logo"
                  className="w-7 h-7 rounded-lg"
                />
              </div>
              <div>
                <h1 className="font-bold text-xl text-white tracking-tight">
                  SisAutBal
                </h1>
                <p className="text-xs text-blue-100 font-medium">
                  Sistema Automatización de Balanza
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="sidebar-button p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 backdrop-blur-sm"
              title="Cerrar menú"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* {activeHeaderMenu && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                  {activeHeaderMenu.imagen ? (
                    <img src={activeHeaderMenu.imagen} alt="" className="w-4 h-4" />
                  ) : (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white text-sm truncate">
                    {activeHeaderMenu.nombre_Acceso}
                  </div>
                  <div className="text-xs text-blue-100 font-medium">
                    ID: {activeHeaderMenu.cod_Acceso}
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>

        {/* Contenido del menú */}
        <div
          className="flex-1 overflow-y-auto sidebar-scroll bg-gradient-to-b from-slate-50/50 to-white"
          style={{ height: "calc(100vh - 160px)" }}
        >
          {menuTree.length > 0 ? (
            <nav className="py-3 px-2">
              {menuTree.map((menu) => renderMenuItem(menu))}
            </nav>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3-6.75H21m-5.25 0V15a2.25 2.25 0 01-2.25 2.25H7.5a2.25 2.25 0 01-2.25-2.25V9a2.25 2.25 0 012.25-2.25h4.5c.621 0 1.125.504 1.125 1.125v1.875m2.625 0V6.375c0-.621.504-1.125 1.125-1.125h1.875c.621 0 1.125.504 1.125 1.125v3.75M18 15.75h-6.75"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                No hay submenús
              </h3>
              <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto leading-relaxed">
                No hay opciones disponibles para mostrar en este momento.
              </p>
              {activeHeaderMenu && (
                <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Selecciona otro menú principal
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer del sidebar mejorado */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 bg-[#003E83] rounded-full animate-pulse"></div>
            <span className="font-medium">SISAUTOBAL</span>
            <span className="text-slate-400">•</span>
            <span>v2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
