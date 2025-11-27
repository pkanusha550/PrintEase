import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export default function Toast({ toast, onClose }) {
  const Icon = icons[toast.type] || Info;

  useEffect(() => {
    if (toast.autoClose) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-card bg-white border-l-4 ${
        toast.type === 'success' ? 'border-green-500' :
        toast.type === 'error' ? 'border-red-500' :
        toast.type === 'warning' ? 'border-yellow-500' :
        'border-blue-500'
      } min-w-[300px] max-w-md animate-slide-in-right`}
      role="alert"
      aria-live="polite"
    >
      <Icon
        className={`flex-shrink-0 mt-0.5 ${
          toast.type === 'success' ? 'text-green-500' :
          toast.type === 'error' ? 'text-red-500' :
          toast.type === 'warning' ? 'text-yellow-500' :
          'text-blue-500'
        }`}
        size={20}
      />
      <div className="flex-1">
        {toast.title && (
          <p className="font-semibold text-sm text-gray-900">{toast.title}</p>
        )}
        <p className="text-sm text-gray-600">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

