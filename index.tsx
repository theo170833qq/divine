import React, { ReactNode, Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Simple Error Boundary to catch render crashes
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("CRITICAL APP ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B101D] text-[#D4AF37] p-8 text-center font-serif">
          <h1 className="text-3xl font-bold mb-4">Pax Christi.</h1>
          <p className="text-lg mb-6">Ocorreu um erro inesperado ao carregar o assistente.</p>
          <div className="bg-black/30 p-4 rounded text-left text-xs text-gray-400 font-mono mb-6 max-w-lg overflow-auto w-full">
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-[#BF953F] to-[#AA771C] text-[#2C241B] font-bold rounded shadow-lg hover:scale-105 transition-transform"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("CRITICAL: Root element #root not found in index.html");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (e) {
    console.error("Failed to mount React app:", e);
    rootElement.innerHTML = '<div style="color:white; padding:20px;">Falha crítica na inicialização. Verifique o console.</div>';
  }
}