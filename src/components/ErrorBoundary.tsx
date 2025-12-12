import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  // Clasificar errores que no deben derribar la UI
  static isErrorNonFatal(error: any): boolean {
    try {
      const message = String(error?.message || error);
      const name = String(error?.name || '');
      const status = (error && typeof error === 'object' ? (error as any).status : undefined) as number | undefined;
      const code = (error && typeof error === 'object' ? (error as any).code : undefined) as string | undefined;

      // Errores de red, tiempo de espera y abortos
      if (/AbortError|NetworkError|Failed to fetch|Request timeout/i.test(message) || /AbortError/i.test(name)) {
        return true;
      }

      // Errores HTTP comunes que no deben derribar toda la UI
      if (typeof status === 'number' && [401, 403, 404, 429].includes(status)) {
        return true;
      }

      // Códigos de red típicos
      if (code && /ECONNREFUSED|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH/i.test(code)) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // No activar UI de error para casos no fatales
    if (ErrorBoundary.isErrorNonFatal(error)) {
      return {
        hasError: false,
        error: null,
      };
    }

    // Actualizar el estado para mostrar la UI de error
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('📍 Error Info:', errorInfo);

    // Generar ID único para el error
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Si el error es no fatal, no activamos la UI de error
    if (ErrorBoundary.isErrorNonFatal(error)) {
      // Aún así reportamos para diagnóstico, pero sin cambiar a estado de error
      this.reportError(error, errorInfo, eventId);
      return;
    }

    this.setState({
      error,
      errorInfo,
      eventId,
    });

    // Llamar callback personalizado si existe
    this.props.onError?.(error, errorInfo);

    // Reportar error a servicio de monitoreo (si está configurado)
    this.reportError(error, errorInfo, eventId);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset automático cuando cambian las props especificadas
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }

    // Reset cuando cambian las resetKeys
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevProps.resetKeys![idx] !== resetKey
      );
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo, eventId: string) => {
    // En desarrollo, solo log a consola
    if (import.meta.env.DEV) {
      console.group(`🐛 Error Report [${eventId}]`);
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Stack:', error.stack);
      console.groupEnd();
      return;
    }

    // En producción, enviar a servicio de monitoreo
    try {
      // Aquí se podría integrar con Sentry, LogRocket, etc.
      const errorReport = {
        eventId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Por ahora solo guardamos en localStorage para debugging
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorReport);

      // Mantener solo los últimos 10 errores
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }

      localStorage.setItem('app_errors', JSON.stringify(existingErrors));
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = () => {
    const { error, errorInfo, eventId } = this.state;
    const errorDetails = {
      eventId,
      error: {
        message: error?.message,
        stack: error?.stack,
      },
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Detalles del error copiados al portapapeles');
      })
      .catch(() => {
        console.error('Failed to copy error details');
      });
  };

  render() {
    const { hasError, error, errorInfo, eventId } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError) {
      // Renderizar UI de fallback personalizada o la predeterminada
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-red-100">
            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. Por favor intenta recargar la página.
            </p>

            {/* Mostrar detalles del error siempre durante depuración */}
            {error && (
              <div className="bg-gray-100 p-4 rounded text-left mb-6 overflow-auto max-h-40 text-xs text-gray-700 font-mono border border-gray-200">
                <p className="font-bold border-b border-gray-300 pb-2 mb-2 text-red-600">{error.toString()}</p>
                {errorInfo?.componentStack}
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar Página
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
              >
                <Home className="mr-2 h-4 w-4" />
                Ir al Inicio
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={this.copyErrorDetails}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center mx-auto"
              >
                <Bug className="h-3 w-3 mr-1" />
                Copiar detalles del error para soporte
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

// Hook para usar con componentes funcionales
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('🚨 Manual error report:', error);
    if (errorInfo) {
      console.error('📍 Error Info:', errorInfo);
    }
  };
};

// Componente wrapper para casos específicos
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};