import React, { useState } from "react";
import { Login } from "../../services/Authentication/AuthenticationService";
import md5 from "crypto-js/md5";
import { useNavigate } from "react-router-dom";
import logo2 from "../../assets/img/Logo_pres.png";
import { FaApple, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

function LoginForm() {
  // Solo login
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Maneja el submit del login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const usuarioLogin = {
        username: usuario,
        password: md5(password).toString(),
        clientId: "string",
        clienteName: "string",
        typeOpId: "string",
        typeOpName: "string",
        warehouseId: "string",
        warehouseName: "string",
        appType: "string",
        mobileId: "string",
        flagDobleFactor: "string",
        tokenGoogle: "string",
        versionMobile: "string",
      };
      const response = await Login(usuarioLogin);
      //
      if (response.jwtToken != null && response.id != "") {
        // Guarda usuario y menús en localStorage
        localStorage.setItem("user", JSON.stringify(response));
        localStorage.setItem("coduser", JSON.stringify(response.codUsuario));
        localStorage.setItem("menus", JSON.stringify(response.listMenu));
        navigate("/inicio", { state: { response } });
      } else {
        const error = response.value;
        setError(error.message);
      }
    } catch (err) {
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-[100%] h-screen place-items-center bg-white-400 px-4">
      <div className="max-w-[860px] w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left: existing login card (keep same content) */}
          <div className="w-full md:w-1/2 p-8">
            <div className="flex flex-col justify-center mb-4">
              <h2 className="text-3xl font-semibold text-center text-[#0f172a]">
                Login
              </h2>
              <p className="text-center text-slate-500 mt-2">
                Ingrese sus credenciales de usuario para iniciar sesión
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  placeholder="m@ejemplo.com"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b3b66]/60 focus:border-transparent transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-sm text-gray-500 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b3b66]/60 focus:border-transparent transition"
                />
              </div>
              {error && (
                <div className="text-red-500 text-center text-sm">{error}</div>
              )}
              <button
                className="w-full py-3 bg-[#0f0f0f] text-white rounded-full text-lg font-semibold hover:bg-black transition-shadow shadow-md"
                disabled={loading}
              >
                {loading ? "Procesando..." : "Login"}
              </button>

              {/* divider + social buttons */}
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="text-sm text-gray-400">BS</div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </div>
            </form>
          </div>

          {/* Right: image area with logo2 centered */}
          <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center p-8">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={logo2}
                alt="logo"
                className="max-w-[60%] max-h-[60%] object-contain opacity-90"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
