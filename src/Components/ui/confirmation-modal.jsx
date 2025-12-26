import React from 'react';
import { Button } from './button';

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción", 
  message = "¿Estás seguro de que deseas continuar?", 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  confirmVariant = "default",
  cancelVariant = "outline",
  icon = null,
  type = "default" // default, warning, danger
}) {
  if (!isOpen) return null;

  const getIconByType = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'warning':
        return (
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full dark:bg-yellow-900/20">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'danger':
        return (
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/20">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full dark:bg-blue-900/20">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getConfirmVariant = () => {
    if (confirmVariant !== "default") return confirmVariant;
    
    switch (type) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-2xl max-w-md w-full m-4">
        {/* Content */}
        <div className="p-6 text-center">
          {getIconByType()}
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {message}
          </p>
          
          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <Button 
              variant={cancelVariant} 
              onClick={onClose}
              className="min-w-20"
            >
              {cancelText}
            </Button>
            <Button 
              variant={getConfirmVariant()} 
              onClick={onConfirm}
              className="min-w-20"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
