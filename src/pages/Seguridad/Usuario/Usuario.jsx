import React, { useState, useEffect } from "react";
import LargeModal from "../../../Components/BaseModal/LargeModel";
import {
  GrabarUsuario,
  EliminarUsuario,
  ListarUsuario,
} from "../../../services/Seguridad/Usuario/UsuarioService";
import { ListarPerfil } from "../../../services/Seguridad/Perfil/PerfilService";
import md5 from "crypto-js/md5";
import { Form } from "react-router-dom";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
const Usuario = () => {
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    codUsuario: "",
    nombre_Usuario: "",
    mail: "",
    flagActDir: false,
    passwd: "",
    idPerfil: 0,
    cod_Personal: "",
    tipo_Usuario: "",
    estado: "",
    userNew:
      typeof window !== "undefined" && window.localStorage.getItem("coduser")
        ? window.localStorage.getItem("coduser")
        : "",
    dateNew: (() => {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    })(),
    userEdit:
      typeof window !== "undefined" && window.localStorage.getItem("coduser")
        ? window.localStorage.getItem("coduser")
        : "",
    dateEdit: (() => {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    })(),
    celular: "",
    flagDobleFactor: false,
    flagSeRegistro2FA: false,
  });
  const [search, setSearch] = useState({
    codUsuario: "",
    nombre_Usuario: "",
    mail: "",
    flagActDir: false,
    passwd: "",
    idPerfil: -1,
    cod_Personal: "",
    tipo_Usuario: "T",
    estado: "T",
    userNew:
      typeof window !== "undefined" && window.localStorage.getItem("coduser")
        ? window.localStorage.getItem("coduser")
        : "",
    dateNew: (() => {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    })(),
    userEdit:
      typeof window !== "undefined" && window.localStorage.getItem("coduser")
        ? window.localStorage.getItem("coduser")
        : "",
    dateEdit: (() => {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    })(),
    celular: "",
    flagDobleFactor: false,
    flagSeRegistro2FA: false,
  });
  const handleEdit = async (usuario) => {
    setEditForm({
      codUsuario: usuario.codUsuario,
      nombre_Usuario: usuario.nombre_Usuario,
      mail: usuario.mail,
      flagActDir: usuario.flagActDir,
      passwd: usuario.passwd,
      idPerfil: usuario.idPerfil,
      cod_Personal: usuario.cod_Personal,
      tipo_Usuario: usuario.tipo_Usuario,
      estado: usuario.estado,
      userNew: usuario.userNew,
      dateNew: usuario.dateNew,
      userEdit: usuario.userEdit,
      dateEdit: usuario.dateEdit,
      celular: usuario.celular,
      flagDobleFactor: usuario.flagDobleFactor,
      flagSeRegistro2FA: usuario.flagSeRegistro2FA,
    });
    setEditModal(true);
  };
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    codUsuario: "",
    nombre_Usuario: "",
    mail: "",
    flagActDir: false,
    passwd: "",
    idPerfil: 0,
    cod_Personal: "",
    tipo_Usuario: "",
    estado: "",
    userNew:
      typeof window !== "undefined" && window.localStorage.getItem("coduser")
        ? window.localStorage.getItem("coduser")
        : "",
    dateNew: (() => {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    })(),
    userEdit:
      typeof window !== "undefined" && window.localStorage.getItem("coduser")
        ? window.localStorage.getItem("coduser")
        : "",
    dateEdit: (() => {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    })(),
    celular: "",
    flagDobleFactor: false,
    flagSeRegistro2FA: false,
  });

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const personalAlertTimeoutRef = React.useRef(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const validateForm = () => {
    const errors = {};
    if (!form.codUsuario)
      errors.codUsuario = "El código de usuario es obligatorio.";
    if (!form.nombre_Usuario)
      errors.nombre_Usuario = "El nombre de usuario es obligatorio.";
    if (!form.mail) {
      errors.mail = "El correo electrónico es obligatorio.";
    } else if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(form.mail)) {
      errors.mail = "El correo electrónico no es válido.";
    }
    if (!form.passwd) errors.passwd = "La contraseña es obligatoria.";
    if (!form.idPerfil) errors.idPerfil = "El perfil es obligatorio.";
    if (!form.cod_Personal)
      errors.cod_Personal = "El código de personal es obligatorio.";
    if (!form.tipo_Usuario)
      errors.tipo_Usuario = "El tipo de usuario es obligatorio.";
    if (!form.estado) errors.estado = "El estado es obligatorio.";
    if (!form.celular) errors.celular = "El celular es obligatorio.";
    return errors;
  };
  const validateFormEdit = () => {
    const errors = {};
    if (!editForm.codUsuario)
      errors.codUsuario = "El código de usuario es obligatorio.";
    if (!editForm.nombre_Usuario)
      errors.nombre_Usuario = "El nombre de usuario es obligatorio.";
    if (!editForm.mail) {
      errors.mail = "El correo electrónico es obligatorio.";
    } else if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(editForm.mail)) {
      errors.mail = "El correo electrónico no es válido.";
    }
    if (!editForm.passwd) errors.passwd = "La contraseña es obligatoria.";
    if (!editForm.idPerfil) errors.idPerfil = "El perfil es obligatorio.";
    if (!editForm.cod_Personal)
      errors.cod_Personal = "El código de personal es obligatorio.";
    if (!editForm.tipo_Usuario)
      errors.tipo_Usuario = "El tipo de usuario es obligatorio.";
    if (!editForm.estado) errors.estado = "El estado es obligatorio.";
    if (!editForm.celular) errors.celular = "El celular es obligatorio.";
    return errors;
  };
  const [idPerfiles, setIdPerfiles] = useState([]);
  const [editIndex] = useState(null);
  const cargarPerfiles = async () => {
    try {
      const data = await ListarPerfil(0, "", "T");
      setIdPerfiles(data);
    } catch {
      // Puedes mostrar un mensaje de error aquí
    }
  };

  useEffect(() => {
    cargarPerfiles();
  }, []);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelCreate = () => {
    setShowModal(false);
    setForm({
      codUsuario: null,
      nombre_Usuario: "",
      mail: "",
      flagActDir: false,
      passwd: "",
      idPerfil: 0,
      cod_Personal: "",
      tipo_Usuario: "",
      estado: "",
      userNew:
        typeof window !== "undefined" && window.localStorage.getItem("coduser")
          ? window.localStorage.getItem("coduser")
          : "",
      dateNew: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      userEdit:
        typeof window !== "undefined" && window.localStorage.getItem("coduser")
          ? window.localStorage.getItem("coduser")
          : "",
      dateEdit: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      celular: "",
      flagDobleFactor: false,
      flagSeRegistro2FA: false,
    });
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditModal(false);
    setEditForm({
      codUsuario: null,
      nombre_Usuario: "",
      mail: "",
      flagActDir: false,
      passwd: "",
      idPerfil: 0,
      cod_Personal: "",
      tipo_Usuario: "",
      estado: "",
      userNew:
        typeof window !== "undefined" && window.localStorage.getItem("coduser")
          ? window.localStorage.getItem("coduser")
          : "",
      dateNew: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      userEdit:
        typeof window !== "undefined" && window.localStorage.getItem("coduser")
          ? window.localStorage.getItem("coduser")
          : "",
      dateEdit: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      celular: "",
      flagDobleFactor: false,
      flagSeRegistro2FA: false,
    });
    setFormErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateFormEdit();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setModalMsg(
        "Por favor complete todos los campos obligatorios." +
          JSON.stringify(errors)
      );

      return;
    }
    try {
      const usuarioEditado = {
        CodUsuario: editForm.codUsuario,
        Nombre_Usuario: editForm.nombre_Usuario,
        Mail: editForm.mail,
        flagActDir: editForm.flagActDir == "on" ? true : editForm.flagActDir,
        Passwd:
          !editForm.passwd || String(editForm.passwd).trim() === ""
            ? usuarios[editIndex]?.passwd ?? ""
            : md5(editForm.passwd).toString(),
        IDPerfil: editForm.idPerfil,
        Cod_Personal: editForm.cod_Personal,
        Tipo_Usuario: editForm.tipo_Usuario,
        Estado: editForm.estado,
        UserNew: editForm.userNew,
        DateNew: editForm.dateNew,
        UserEdit: editForm.userEdit,
        DateEdit: editForm.dateEdit,
        Celular: editForm.celular,
        flagDobleFactor:
          editForm.flagDobleFactor == "on" ? true : editForm.flagDobleFactor,
        flagSeRegistro2FA:
          editForm.flagSeRegistro2FA == "on"
            ? true
            : editForm.flagSeRegistro2FA,
      };
      const resp = await GrabarUsuario(usuarioEditado);
      if (resp) {
        setModalMsg("Usuario editado correctamente.");

        cargarUsuarios();
      } else {
        setModalMsg("Error al editar el usuario.");
        setShowErrorModal(true);
      }
    } catch {
      setModalMsg("Error al editar el usuario.");
      setShowErrorModal(true);
    }
    setEditModal(false);
    setEditForm({
      codUsuario: null,
      nombre_Usuario: "",
      mail: "",
      flagActDir: false,
      passwd: "",
      idPerfil: 0,
      cod_Personal: "",
      tipo_Usuario: "",
      estado: "",
      userNew: "",
      dateNew: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      userEdit: "",
      dateEdit: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      celular: "",
      flagDobleFactor: false,
      flagSeRegistro2FA: false,
    });
    setFormErrors({});
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar advertencia de ese campo si existe
    setFormErrors((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };
  const handleCancelSearch = () => {
    setSearch({
      codUsuario: "",
      nombre_Usuario: "",
      mail: "",
      flagActDir: false,
      passwd: "",
      idPerfil: -1,
      cod_Personal: "",
      tipo_Usuario: "T",
      estado: "T",
      userNew: "",
      dateNew: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      userEdit: "",
      dateEdit: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      celular: "",
      flagDobleFactor: false,
      flagSeRegistro2FA: false,
    });
    setFilteredUsuarios(usuarios);
  };

  const filtrarUsuarios = () => {
    setLoading(true);
    (async () => {
      try {
        const busqueda = {
          codUsuario: search.codUsuario,
          nombre_Usuario: search.nombre_Usuario,
          mail: search.mail,
          flagActDir: search.flagActDir,
          passwd: search.passwd,
          idPerfil: search.idPerfil,
          cod_Personal: search.cod_Personal,
          tipo_Usuario: search.tipo_Usuario,
          estado: search.estado,
          userNew: search.userNew,
          dateNew: search.dateNew,
          userEdit: search.userEdit,
          dateEdit: search.dateEdit,
          celular: search.celular,
          flagDobleFactor: search.flagDobleFactor,
          flagSeRegistro2FA: search.flagSeRegistro2FA,
        };
        const data = await ListarUsuario(busqueda);
        setFilteredUsuarios(data || []);
      } catch {
        setFilteredUsuarios([]);
      }
      setLoading(false);
    })();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setModalMsg("Por favor complete todos los campos obligatorios.");

      return;
    }
    try {
      const usuarioGuardar = {
        CodUsuario: form.codUsuario,
        Nombre_Usuario: form.nombre_Usuario,
        Mail: form.mail,
        flagActDir: form.flagActDir == "on" ? true : form.flagActDir,
        Passwd: md5(form.passwd).toString(),
        IDPerfil: form.idPerfil,
        Cod_Personal: form.cod_Personal,
        Tipo_Usuario: form.tipo_Usuario,
        Estado: form.estado,
        UserNew: form.userNew,
        DateNew: form.dateNew,
        UserEdit: form.userEdit,
        DateEdit: form.dateEdit,
        Celular: form.celular,
        flagDobleFactor:
          form.flagDobleFactor == "on" ? true : form.flagDobleFactor,
        flagSeRegistro2FA:
          form.flagSeRegistro2FA == "on" ? true : form.flagSeRegistro2FA,
      };
      const resp = await GrabarUsuario(usuarioGuardar);
      if (resp) {
        setModalMsg("Usuario guardado correctamente.");

        cargarUsuarios();
      } else {
        setModalMsg("Error al guardar el usuario.");
        setShowErrorModal(true);
      }
    } catch {
      setModalMsg("Error al guardar el usuario.");
      setShowErrorModal(true);
    }
    setShowModal(false);
    setForm({
      codUsuario: null,
      nombre_Usuario: "",
      mail: "",
      flagActDir: false,
      passwd: "",
      idPerfil: 0,
      cod_Personal: "",
      tipo_Usuario: "",
      estado: "",
      userNew: "",
      dateNew: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      userEdit: "",
      dateEdit: (() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      })(),
      celular: "",
      flagDobleFactor: false,
      flagSeRegistro2FA: false,
    });
    setFormErrors({});
  };
  React.useEffect(
    () => () => {
      if (personalAlertTimeoutRef.current)
        clearTimeout(personalAlertTimeoutRef.current);
    },
    []
  );

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await ListarUsuario();
      setUsuarios(data);
      setFilteredUsuarios(data);
    } catch {
      // Puedes mostrar un mensaje de error aquí
    }
    setLoading(false);
  };
  React.useEffect(() => {
    filtrarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, usuarios]);

  const handleDelete = async (codUsuario) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    setLoading(true);
    try {
      const resp = await EliminarUsuario(codUsuario);
      if (resp) {
        alert("Usuario eliminado correctamente.");
        cargarUsuarios();
      } else {
        alert("Error al eliminar el usuario.");
      }
    } catch {
      alert("Error al eliminar el usuario.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GESTION DE USUARIOS</h1>
            <p className="text-muted-foreground">
              Administra y consulta información de usuarios del sistema.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-4">
          {/* Filtros de búsqueda */}
          <div className="flex items-center gap-2 mb-4">
            <Button icon="filter" variant="ghost" size="sm" />
            <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="codUsuario"
                className="text-sm font-medium mb-2 block"
              >
                Código Usuario
              </label>
              <Input
                id="codUsuario"
                type="text"
                name="codUsuario"
                value={search.codUsuario}
                onChange={handleSearchChange}
                placeholder="Buscar por Código de Usuario"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="nombre_Usuario"
                className="text-sm font-medium mb-2 block"
              >
                Nombre Usuario
              </label>
              <Input
                id="nombre_Usuario"
                type="text"
                name="nombre_Usuario"
                value={search.nombre_Usuario}
                onChange={handleSearchChange}
                placeholder="Buscar por Nombre de Usuario"
              />
            </div>
            <div className="space-y-3">
              <label
                htmlFor="idPerfil"
                className="text-sm font-medium mb-2 block"
              >
                ID Perfil
              </label>
              <select
                name="idPerfil"
                value={search.idPerfil ?? ""}
                onChange={handleSearchChange}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="-1">Todos</option>
                {idPerfiles.map((perfil) => (
                  <option key={perfil.idPerfil} value={perfil.idPerfil}>
                    {perfil.des_Perfil}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="estado"
                className="text-sm font-medium mb-2 block"
              >
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={search.estado}
                onChange={handleSearchChange}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="T">Todos los estados</option>
                <option value="A">Activo </option>
                <option value="I">Inactivo</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="tipo_usuario"
                className="text-sm font-medium mb-2 block"
              >
                Tipo Usuario
              </label>
              <select
                id="tipo_usuario"
                name="tipo_Usuario"
                value={search.tipo_Usuario}
                onChange={handleSearchChange}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="T">Todos</option>
                <option value="A">Administrador</option>
                <option value="U">Usuario</option>
                <option value="V">Visitante</option>
              </select>
            </div>
          </div>
          {/* Botones de filtros */}
          <div className="flex gap-2 mb-4  mt-5">
            <Button onClick={filtrarUsuarios} disabled={loading}>
              🔍 Buscar
            </Button>
            <Button variant="outline" onClick={handleCancelSearch}>
              🗑️ Limpiar Filtros
            </Button>
            <Button
              icon="plus"
              variant="default"
              onClick={() => setShowModal(true)}
            >
              Nuevo
            </Button>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg">
          <div>
            {loading && (
              <div className="p-8 text-center">
                <div className="animate-pulse text-muted-foreground">
                  Cargando reportes...
                </div>
              </div>
            )}
            {!loading && (
              <div>
                {/* Header de la tabla */}
                <div className="px-6 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Usuarios({filteredUsuarios.length})
                    </h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Código Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Nombre Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Mail
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          ID Perfil
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Tipo Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Celular
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                      {filteredUsuarios.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center text-gray-500 py-8"
                          >
                            No se encontraron Usuarios
                          </td>
                        </tr>
                      ) : (
                        filteredUsuarios.map((p, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0
                                ? "bg-white hover:bg-blue-50 transition"
                                : "bg-gray-50 hover:bg-blue-50 transition"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {p.codUsuario}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {p.nombre_Usuario}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {p.mail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {p.idPerfil}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {p.estado}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {p.tipo_Usuario}
                            </td>
                            <td className="py-2 px-2 sm:px-4 border-b whitespace-nowrap">
                              {p.celular}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(p)}
                                >
                                  ✏️ Editar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(p.codUsuario)}
                                >
                                  🗑️ Eliminar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <LargeModal
        show={showModal}
        title="Crear Nuevo Usuario"
        onClose={() => {
          setShowModal(false);
          setForm({
            codUsuario: null,
            nombre_Usuario: "",
            mail: "",
            flagActDir: false,
            passwd: "",
            idPerfil: 0,
            cod_Personal: "",
            tipo_Usuario: "",
            estado: "",
            userNew: localStorage.getItem("coduser"),
            dateNew: (() => {
              const now = new Date();
              return now.toISOString().slice(0, 16);
            })(),
            userEdit: localStorage.getItem("coduser"),
            dateEdit: (() => {
              const now = new Date();
              return now.toISOString().slice(0, 16);
            })(),
            celular: "",
            flagDobleFactor: false,
            flagSeRegistro2FA: false,
          });
          setFormErrors({});
        }}
        className="w-auto h-auto max-w-fit max-h-fit"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Código Usuario
              </label>
              <input
                name="codUsuario"
                value={form.codUsuario}
                onChange={handleChange}
                placeholder="Ingrese el código de usuario"
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.codUsuario ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {formErrors.codUsuario && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.codUsuario}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nombre Usuario
              </label>
              <input
                name="nombre_Usuario"
                value={form.nombre_Usuario}
                onChange={handleChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.nombre_Usuario ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Ingrese el nombre de usuario"
              />
              {formErrors.nombre_Usuario && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.nombre_Usuario}
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Mail</label>
              <input
                name="mail"
                value={form.mail}
                onChange={handleChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.mail ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Ingrese el mail"
              />
              {formErrors.mail && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.mail}
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center mt-5 w-[290px]">
              <input
                type="checkbox"
                name="flagActDir"
                checked={form.flagActDir}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label className="font-extrabold text-gray-700 text-base ml-2">
                Activo Directorio
              </label>
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Password
              </label>
              <input
                name="passwd"
                value={form.passwd}
                onChange={handleChange}
                placeholder="Ingrese la contraseña"
                type="password"
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.passwd ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {formErrors.passwd && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.passwd}
                </label>
              )}
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                ID Perfil
              </label>
              <select
                name="idPerfil"
                value={form.idPerfil}
                onChange={handleChange}
                placeholder="Seleccione..."
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.idPerfil ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Seleccione...</option>
                {idPerfiles.map((perfil) => (
                  <option key={perfil.idPerfil} value={perfil.idPerfil}>
                    {perfil.des_Perfil}
                  </option>
                ))}
              </select>
              {formErrors.idPerfil && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.idPerfil}
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Código Personal
              </label>
              <input
                name="cod_Personal"
                value={form.cod_Personal}
                onChange={handleChange}
                placeholder="Ingrese el código personal"
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.cod_Personal ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {formErrors.cod_Personal && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.cod_Personal}
                </label>
              )}
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Tipo Usuario
              </label>
              <select
                name="tipo_Usuario"
                value={form.tipo_Usuario}
                onChange={handleChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.tipo_Usuario ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Todos</option>
                <option value="A">Administrador</option>
                <option value="U">Usuario</option>
                <option value="V">Visitante</option>
              </select>
              {formErrors.tipo_Usuario && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.tipo_Usuario}
                </label>
              )}
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Estado
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.estado ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Seleccione...</option>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
              {formErrors.estado && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.estado}
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Celular
              </label>
              <input
                name="celular"
                value={form.celular}
                onChange={handleChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.celular ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Ingrese el celular"
              />
              {formErrors.celular && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.celular}
                </label>
              )}
            </div>
            <div className="flex items-center mt-5 w-1/2">
              <input
                type="checkbox"
                name="flagDobleFactor"
                checked={form.flagDobleFactor}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label className="font-extrabold text-gray-700 text-base ml-2">
                Doble Factor
              </label>
            </div>
            <div className="flex items-center mt-5 w-1/2">
              <input
                type="checkbox"
                name="flagSeRegistro2FA"
                checked={form.flagSeRegistro2FA}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label className="font-extrabold text-gray-700 text-base ml-2">
                Se Registró 2FA
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelCreate}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="bg-black text-white border-black hover:bg-gray-800"
            >
              Guardar
            </Button>
          </div>
        </form>
      </LargeModal>
      <LargeModal
        show={editModal}
        title="Editar Usuario"
        onClose={() => setEditModal(false)}
        className="w-auto h-auto max-w-fit max-h-fit"
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-sm mb-1 text-left">
                Código Usuario
              </label>
              <input
                name="Cod_Usuario"
                value={editForm.codUsuario}
                onChange={handleEditChange}
                placeholder="Ingrese el código de usuario"
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.codUsuario ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {formErrors.codUsuario && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.codUsuario}
                </label>
              )}
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1 text-left">
                Nombre Usuario
              </label>
              <input
                name="nombre_Usuario"
                value={editForm.nombre_Usuario}
                onChange={handleEditChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.nombre_Usuario ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Ingrese el nombre de usuario"
              />
              {formErrors.nombre_Usuario && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.nombre_Usuario}
                </label>
              )}
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1 text-left">
                Mail
              </label>
              <input
                name="Mail"
                value={editForm.mail}
                onChange={handleEditChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.mail ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Ingrese el mail"
              />
              {formErrors.mail && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.mail}
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center mt-5 w-[290px]">
              <input
                type="checkbox"
                name="flagActDir"
                checked={editForm.flagActDir}
                onChange={handleEditChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label className="font-extrabold text-gray-700 text-base ml-2">
                Activo Directorio
              </label>
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Password
              </label>
              <input
                name="passwd"
                value={editForm.passwd}
                onChange={handleEditChange}
                placeholder="Ingrese la contraseña"
                type="password"
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.passwd ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {formErrors.passwd && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.passwd}
                </label>
              )}
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                ID Perfil
              </label>
              <select
                name="idPerfil"
                value={editForm.idPerfil}
                onChange={handleEditChange}
                placeholder="Seleccione..."
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.idPerfil ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Seleccione...</option>
                {idPerfiles.map((perfil) => (
                  <option key={perfil.idPerfil} value={perfil.idPerfil}>
                    {perfil.des_Perfil}
                  </option>
                ))}
              </select>
              {formErrors.idPerfil && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.idPerfil}
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Código Personal
              </label>
              <input
                name="cod_Personal"
                value={editForm.cod_Personal}
                onChange={handleEditChange}
                placeholder="Ingrese el código personal"
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.cod_Personal ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {formErrors.cod_Personal && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.cod_Personal}
                </label>
              )}
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Tipo Usuario
              </label>
              <select
                name="tipo_Usuario"
                value={editForm.tipo_Usuario}
                onChange={handleEditChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.tipo_Usuario ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Todos</option>
                <option value="A">Administrador</option>
                <option value="U">Usuario</option>
                <option value="V">Visitante</option>
              </select>
              {formErrors.tipo_Usuario && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.tipo_Usuario}
                </label>
              )}
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Estado
              </label>
              <select
                name="estado"
                value={editForm.estado}
                onChange={handleEditChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.estado ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Seleccione...</option>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
              {formErrors.estado && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.estado}
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-1 text-left">
                Celular
              </label>
              <input
                name="celular"
                value={editForm.celular}
                onChange={handleEditChange}
                className={`input input-bordered w-full rounded-lg border-2 h-8 text-sm px-2 ${
                  formErrors.celular ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Ingrese el celular"
              />
              {formErrors.celular && (
                <label className="text-xs text-red-600 mt-1 block text-left">
                  {formErrors.celular}
                </label>
              )}
            </div>
            <div className="flex items-center mt-5 w-1/2">
              <input
                type="checkbox"
                name="flagDobleFactor"
                checked={editForm.flagDobleFactor}
                onChange={handleEditChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label className="font-extrabold text-gray-700 text-base ml-2">
                Doble Factor
              </label>
            </div>
            <div className="flex items-center mt-5 w-1/2">
              <input
                type="checkbox"
                name="flagSeRegistro2FA"
                checked={editForm.flagSeRegistro2FA}
                onChange={handleEditChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label className="font-extrabold text-gray-700 text-base ml-2">
                Se Registró 2FA
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="bg-black text-white border-black hover:bg-gray-800"
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </LargeModal>
      {/* Error Modal */}
      <LargeModal
        show={showErrorModal}
        title="Error"
        onClose={() => setShowErrorModal(false)}
        className="w-auto h-auto max-w-fit max-h-fit"
      >
        <div className="p-4 text-center">
          <span className="text-red-600 font-semibold text-lg">{modalMsg}</span>
          <div className="mt-4 flex justify-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold"
              onClick={() => setShowErrorModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </LargeModal>
    </div>
  );
};

export default Usuario;
