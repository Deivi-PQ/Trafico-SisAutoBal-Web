import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeaderBar = ({
  activeHeaderMenu,
  onHeaderMenuChange,
  onMenuToggle,
  menuOpen,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dropdownOpen) return;

    function handleOutsideEvent(e) {
      const path = e.composedPath ? e.composedPath() : e.path || [];
      const clickedInside =
        dropdownRef.current &&
        (path.length
          ? path.includes(dropdownRef.current)
          : dropdownRef.current.contains(e.target));
      if (!clickedInside) setDropdownOpen(false);
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") setDropdownOpen(false);
    }

    document.addEventListener("click", handleOutsideEvent, true);
    document.addEventListener("touchstart", handleOutsideEvent, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("click", handleOutsideEvent, true);
      document.removeEventListener("touchstart", handleOutsideEvent, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [dropdownOpen]);

  // Obtener datos del usuario y menús desde localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const menus = JSON.parse(localStorage.getItem("menus") || "[]");

  // Filtrar menús de nivel 0 (codAcceso terminados en 0000) para HeaderBar
  const headerMenus = menus.filter((menu) => {
    const codStr = String(menu.cod_Acceso);
    return menu.nivel === 0 || (codStr.length >= 5 && codStr.endsWith("0000"));
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleHeaderMenuClick = (menu) => {
    onHeaderMenuChange(menu);
    // Auto-abrir sidebar cuando se selecciona un menú del header
    if (!menuOpen) {
      onMenuToggle();
    }
    // cerrar dropdown del usuario si está abierto
    setDropdownOpen(false);
    // Si el menú tiene ruta directa, navegar
    if (menu.ruta || menu.comando) {
      navigate(menu.ruta || menu.comando);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-lg">
      {/* Barra superior principal */}
      <div className="sidebar-header flex items-center px-4 sm:px-6 py-3 relative">
        {/* Sección izquierda: Botón hamburguesa, Logo y título */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={onMenuToggle}
            className="sidebar-button p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 backdrop-blur-sm"
            aria-label="Mostrar/ocultar menú lateral"
            title={menuOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
          >
            {menuOpen ? (
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
            ) : (
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
            <img src="../Logo.png" alt="Logo" className="w-6 h-6 rounded-lg" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">
              SISAUTOBAL
            </h1>
            <p className="text-xs text-blue-100 font-medium">
              Sistema Automatizacion de Balanza
            </p>
          </div>
        </div>

        {/* Sección central: Menús de navegación horizontal */}
        {headerMenus.length > 0 && (
          <nav className="flex-1 flex items-center justify-center px-4">
            <div className="flex items-center justify-center space-x-2 max-w-5xl w-full">
              {headerMenus.map((menu) => (
                <button
                  key={menu.cod_Acceso}
                  onClick={() => handleHeaderMenuClick(menu)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeHeaderMenu?.cod_Acceso === menu.cod_Acceso
                      ? "bg-white/20 text-white border border-white/30 shadow-md"
                      : "text-blue-50 hover:text-white hover:bg-[#002D60]/40 backdrop-blur-sm"
                  }`}
                >
                  {menu.imagen ? (
                    <img src={menu.imagen} alt="" className="w-4 h-4" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-white/70"></div>
                  )}
                  <span className="text-xs sm:text-sm">
                    {menu.nombre_Acceso}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* Sección derecha: Usuario */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 focus:outline-none rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 transition-all duration-200 backdrop-blur-sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={userData?.avatar || userData?.imagen || "/avatar.png"}
                  alt="avatar"
                  className="w-6 h-6 object-cover"
                />
              </div>
              <span className="font-medium text-white hidden sm:block">
                {userData?.username || userData?.id || "Usuario"}
              </span>
              <svg
                className="w-4 h-4 text-blue-100"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl z-50 border border-slate-200/80 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                  <div className="font-semibold text-slate-800">
                    {userData?.username || userData?.id || "Usuario"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {userData?.idPerson
                      ? `Código Usuario: ${userData.idPerson}`
                      : ""}
                  </div>
                  {userData?.idPerfil && (
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#003E83] rounded-full"></span>
                      Rol: {userData.id}
                    </div>
                  )}
                </div>
                <button
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                  onClick={handleLogout}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                    />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
