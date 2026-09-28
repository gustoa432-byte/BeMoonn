import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-medium backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
              toast.type === 'error'
                ? 'bg-white/95 text-[#C62828] border-[#FFCDD2] shadow-[0_4px_16px_rgba(198,40,40,0.12)]'
                : toast.type === 'success'
                ? 'bg-white/95 text-[#2E7D32] border-[#C8E6C9] shadow-[0_4px_16px_rgba(46,125,50,0.12)]'
                : 'bg-white/95 text-[#2D2738] border-[#EDE8F3] shadow-[0_4px_16px_rgba(107,91,149,0.12)]'
            }`}
          >
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-[#C62828]" />}
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D32]" />}
            {toast.type === 'info' && <Info className="w-4 h-4 shrink-0 text-[#6B5B95]" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-75 transition-opacity cursor-pointer shrink-0"
              aria-label="Закрыть уведомление"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      showToast: (msg: string) => console.log('[Toast fallback]:', msg),
    };
  }
  return context;
};
