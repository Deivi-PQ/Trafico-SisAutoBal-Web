# Sistema de Navegación HeaderBar + SideBar

## Descripción

Nuevo sistema de navegación que utiliza la jerarquía de menús almacenada en `localStorage` para crear una navegación intuitiva con HeaderBar horizontal y SideBar jerárquico.

## Arquitectura

### Componentes

1. **HeaderBar.jsx**

   - Navegación horizontal en la parte superior
   - Muestra menús de nivel 0 (códigos terminados en 0000)
   - Dropdown de usuario con información y logout
   - Responsive con scroll horizontal

2. **SideBar.jsx**

   - Navegación lateral jerárquica
   - Muestra hijos del menú activo en HeaderBar
   - Expansión/colapso de elementos
   - Overlay para móvil

3. **NewBaseLayout.jsx**
   - Layout principal que integra HeaderBar y SideBar
   - Maneja el estado de apertura/cierre
   - Responsive con margins automáticos

## Lógica de Navegación

### HeaderBar

- **Criterio de inclusión**: `menu.nivel === 0` O `codAcceso.endsWith('0000')`
- **Ejemplos**: 10000, 20000, 30000
- **Funcionalidad**: Al hacer clic en un elemento, se activa y muestra sus hijos en el SideBar

### SideBar

- **Criterio de inclusión**: Hijos del menú activo del HeaderBar
- **Jerarquía**: Utiliza `menu.nivel` para determinar la profundidad
- **Expansión**: Elementos con hijos se pueden expandir/contraer
- **Navegación**: Elementos con `ruta` o `comando` navegan directamente

## Estructura de Datos

### Menú esperado en localStorage

```javascript
{
  cod_Acceso: 10000,
  nombre_Acceso: "Procesos",
  nivel: 0,
  ruta: "/procesos",
  imagen: "/icon-procesos.png" // opcional
}
```

### Usuario esperado en localStorage

```javascript
{
  nombre_Usuario: "Juan Pérez",
  codUsuario: "ADMIN01",
  avatar: "/avatar.png" // opcional
}
```

## Características

### ✅ Responsive Design

- Desktop: HeaderBar fijo + SideBar lateral
- Móvil: HeaderBar fijo + SideBar overlay

### ✅ Estados Visuales

- Menú activo en HeaderBar resaltado
- Elementos expandidos con rotación de flecha
- Hover effects y transiciones suaves

### ✅ Navegación Inteligente

- Auto-apertura de SideBar al seleccionar HeaderBar
- Cierre automático en móvil después de navegar
- Scroll horizontal en HeaderBar para muchos elementos

### ✅ Iconos y Branding

- Logo Minsur en HeaderBar
- Iconos personalizados por menú
- Avatar de usuario con dropdown

## Integración en App.jsx

```jsx
import NewBaseLayout from "./Components/navigation/NewBaseLayout.jsx";

// Estructura de rutas
<Route path="/*" element={<NewBaseLayout />}>
  <Route path="inicio" element={<Inicio />} />
  <Route path="demo" element={<DemoNavigation />} />
  // ... más rutas
</Route>;
```

## Páginas de Ejemplo

- **`/demo`**: Página que muestra el estado actual de los menús
- Muestra estadísticas de menús por nivel
- Información del usuario logueado
- Instrucciones de uso

## Personalización

### Colores por Nivel

```jsx
// En SideBar.jsx
const colors = {
  1: "bg-blue-500", // Nivel 1
  2: "bg-green-500", // Nivel 2
  3: "bg-purple-500", // Nivel 3+
};
```

### Responsive Breakpoints

- `md:` (768px+): Diseño desktop
- `sm:` (640px+): Elementos intermedios
- Base: Diseño móvil

## Dependencias

- React Router DOM para navegación
- Tailwind CSS para estilos
- LocalStorage para datos de menús y usuario

## Rutas Disponibles

Después del login, todas las rutas están bajo NewBaseLayout:

- `/inicio` - Página principal
- `/demo` - Demostración del sistema de navegación
- `/clasevento` - Gestión de clase eventos
- `/usuario` - Gestión de usuarios
- `/perfil` - Gestión de perfiles
- `/acceso` - Gestión de accesos

## Flujo de Uso

1. **Login**: Establece datos en localStorage
2. **HeaderBar**: Muestra menús de nivel 0
3. **Selección**: Usuario hace clic en menú del header
4. **SideBar**: Se abre mostrando hijos del menú seleccionado
5. **Navegación**: Usuario navega por la jerarquía
6. **Responsive**: En móvil, el sidebar se cierra automáticamente

## Ventajas del Sistema

- ✅ Escalable para cualquier cantidad de menús
- ✅ Utiliza datos existentes del backend
- ✅ Navegación intuitiva y familiar
- ✅ Completamente responsive
- ✅ Fácil mantenimiento y personalización
- ✅ Integración perfecta con React Router
