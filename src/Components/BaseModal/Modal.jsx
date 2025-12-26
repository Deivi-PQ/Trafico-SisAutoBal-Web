import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';

// Keep small set of type styles for backward compatibility (used for the action button / title icon)
const typeStyles = {
  success: { bg: 'bg-green-600 hover:bg-green-700', text: 'text-green-700', icon: '✅', title: 'Éxito' },
  error: { bg: 'bg-red-600 hover:bg-red-700', text: 'text-red-700', icon: '❌', title: 'Error' },
  info: { bg: 'bg-blue-600 hover:bg-blue-700', text: 'text-blue-700', icon: 'ℹ️', title: 'Información' },
  warning: { bg: 'bg-yellow-500 hover:bg-yellow-600', text: 'text-yellow-700', icon: '⚠️', title: 'Advertencia' },
  default: { bg: 'bg-gray-600 hover:bg-gray-700', text: 'text-gray-700', icon: '', title: '' }
};

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl'
};

/**
 * Modal compatible con la API existente (props comunes usadas en BaseModal):
 * - show: boolean
 * - type: success|error|info|warning|default
 * - title, message, onClose
 * - children: contenido personalizado (si se provee, message/botón son opcionales)
 * - size: acepta 'default'|'large' (viejo) o 'sm'|'md'|'lg'|'xl' (nuevo)
 */
const Modal = ({ show, type = 'default', message, onClose, title, children, size = 'default', className = '' }) => {
  const [mounted, setMounted] = useState(false);
  const [container] = useState(() => (typeof document !== 'undefined' ? document.createElement('div') : null));

  useEffect(() => {
    setMounted(true);
    if (!container) return;
    document.body.appendChild(container);
    return () => {
      if (document.body.contains(container)) document.body.removeChild(container);
    };
  }, [container]);

  if (!show || !mounted || !container) return null;

  const style = typeStyles[type] || typeStyles.default;

  // Resolve size: support legacy 'default'/'large' and new sm/md/lg/xl
  let resolved = 'md';
  if (size === 'default') resolved = 'md';
  else if (size === 'large') resolved = 'xl';
  else if (sizeClasses[size]) resolved = size;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className={`relative bg-card border border-border rounded-lg shadow-lg ${sizeClasses[resolved]} w-full m-4 max-h-[90vh] overflow-auto ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {style.icon ? <div className={`text-2xl ${style.text}`}>{style.icon}</div> : null}
            <h2 className="text-lg font-semibold">{title || style.title}</h2>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children ? (
            children
          ) : (
            <>
              {message ? <div className="mb-4 text-base text-gray-700">{message}</div> : null}
              <div className="flex justify-end">
                <button className={`${style.bg} text-white px-6 py-2 rounded font-bold`} onClick={onClose}>
                  Cerrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    container
  );
};

export default Modal;
