import React from 'react';

export function FullScreenLoading({ isVisible, message = "Procesando..." }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-background border border-border rounded-lg p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            {/* Spinner */}
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-primary/30"></div>
            </div>
            
            {/* Message */}
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-1">Por favor espere...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
