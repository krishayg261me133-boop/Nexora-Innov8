import { createRoot } from 'react-dom/client';
import { CheckCircle2, XCircle, Info, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  type: ToastType;
  message: string;
}

let container: HTMLDivElement | null = null;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }
  return container;
}

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const styles: Record<ToastType, string> = {
  success: 'border-tealx-200 bg-tealx-50 text-tealx-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-brand-200 bg-brand-50 text-brand-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-tealx-500',
  error: 'text-red-500',
  info: 'text-brand-500',
  warning: 'text-amber-500',
};

function renderToast(data: ToastData) {
  const div = document.createElement('div');
  div.className = 'pointer-events-auto animate-slide-right';
  const Icon = icons[data.type];
  const root = createRoot(div);
  root.render(
    <div className={`flex items-center gap-3 rounded-xl border ${styles[data.type]} px-4 py-3 shadow-card-hover backdrop-blur-sm`}>
      <Icon className={`h-5 w-5 shrink-0 ${iconColors[data.type]}`} />
      <span className="text-sm font-medium">{data.message}</span>
    </div>
  );
  getContainer().appendChild(div);
  setTimeout(() => {
    div.style.transition = 'opacity 0.3s, transform 0.3s';
    div.style.opacity = '0';
    div.style.transform = 'translateX(20px)';
    setTimeout(() => {
      root.unmount();
      div.remove();
    }, 300);
  }, 3500);
}

export const toast = {
  success: (message: string) => renderToast({ type: 'success', message }),
  error: (message: string) => renderToast({ type: 'error', message }),
  info: (message: string) => renderToast({ type: 'info', message }),
  warning: (message: string) => renderToast({ type: 'warning', message }),
};
