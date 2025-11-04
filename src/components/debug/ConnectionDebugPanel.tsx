import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import { RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle, Info } from 'lucide-react';
import backendConnectionService, { ConnectionStatus } from '@/services/backendConnectionService';

interface DebugInfo {
  connectionStatus: ConnectionStatus;
  availableUrls: string[];
  currentUrl: string;
  isDevelopment: boolean;
  environment: string;
  viteApiUrl: string;
}

export const ConnectionDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isTestingUrls, setIsTestingUrls] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      const info = backendConnectionService.getDebugInfo();
      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);

    return () => clearInterval(interval);
  }, []);

  // Solo mostrar en desarrollo o cuando se presiona Ctrl+Shift+D
  // Importante: los hooks deben ejecutarse SIEMPRE en el mismo orden.
  // Por eso estos efectos se declaran ANTES de cualquier return condicional.
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Auto-mostrar en desarrollo cuando haya información disponible
  useEffect(() => {
    if (debugInfo?.isDevelopment) {
      setIsVisible(true);
    }
  }, [debugInfo?.isDevelopment]);

  const testAllUrls = async () => {
    if (!debugInfo) return;
    
    setIsTestingUrls(true);
    const results: Record<string, any> = {};

    for (const url of debugInfo.availableUrls) {
      try {
        console.log(`Testing URL: ${url}/health`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const startTime = Date.now();
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        const endTime = Date.now();

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          results[url] = {
            status: 'success',
            responseTime: endTime - startTime,
            statusCode: response.status,
            data
          };
        } else {
          results[url] = {
            status: 'error',
            responseTime: endTime - startTime,
            statusCode: response.status,
            error: `HTTP ${response.status}`
          };
        }
      } catch (error: any) {
        results[url] = {
          status: 'error',
          error: error.message,
          responseTime: null
        };
      }
    }

    setTestResults(results);
    setIsTestingUrls(false);
  };

  const forceHealthCheck = async () => {
    // En desarrollo, no hacer peticiones para evitar ERR_ABORTED
    if (import.meta.env.DEV) {
      console.log('🔧 Force health check skipped in development mode');
      return;
    }
    await backendConnectionService.checkHealth();
  };

  if (!debugInfo) return null;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Debug de Conexión
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={forceHealthCheck}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 text-xs">
          {/* Estado de Conexión */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Estado:</span>
              <div className="flex items-center gap-2">
                {debugInfo.connectionStatus.isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <Badge variant="default" className="text-xs">Conectado</Badge>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-red-500" />
                    <Badge variant="destructive" className="text-xs">Desconectado</Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>URL Actual:</span>
              <code className="text-xs bg-muted px-1 rounded">
                {debugInfo.connectionStatus.currentUrl || debugInfo.currentUrl}
              </code>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Reintentos:</span>
              <Badge variant="outline" className="text-xs">
                {debugInfo.connectionStatus.retryCount}
              </Badge>
            </div>
            
            {debugInfo.connectionStatus.error && (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-600 text-xs break-all">
                  {debugInfo.connectionStatus.error}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-border my-2" />

          {/* Información del Entorno */}
          <div className="space-y-2">
            <h4 className="font-medium">Entorno</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Modo:</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {debugInfo.environment}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Dev:</span>
                <Badge variant={debugInfo.isDevelopment ? "default" : "secondary"} className="ml-1 text-xs">
                  {debugInfo.isDevelopment ? 'Sí' : 'No'}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">VITE_API_URL:</span>
              <code className="ml-1 text-xs bg-muted px-1 rounded">
                {debugInfo.viteApiUrl || 'undefined'}
              </code>
            </div>
          </div>

          <div className="border-t border-border my-2" />

          {/* URLs Disponibles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">URLs Disponibles</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={testAllUrls}
                disabled={isTestingUrls}
                className="h-6 text-xs"
              >
                {isTestingUrls ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  'Probar'
                )}
              </Button>
            </div>
            
            <div className="space-y-1">
              {debugInfo.availableUrls.map((url, index) => {
                const testResult = testResults[url];
                const isCurrent = url === (debugInfo.connectionStatus.currentUrl || debugInfo.currentUrl);
                
                return (
                  <div key={index} className="flex items-center justify-between p-1 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      {isCurrent && <CheckCircle className="h-3 w-3 text-green-500" />}
                      <code className="text-xs">{url}</code>
                    </div>
                    
                    {testResult && (
                      <div className="flex items-center gap-1">
                        {testResult.status === 'success' ? (
                          <>
                            <Badge variant="default" className="text-xs">OK</Badge>
                            <span className="text-xs text-muted-foreground">
                              {testResult.responseTime}ms
                            </span>
                          </>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Error
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resultados de Pruebas */}
          {Object.keys(testResults).length > 0 && (
            <>
              <div className="border-t border-border my-2" />
              <div className="space-y-2">
                <h4 className="font-medium">Resultados de Pruebas</h4>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {Object.entries(testResults).map(([url, result]) => (
                    <div key={url} className="p-2 rounded bg-muted/50 text-xs">
                      <div className="font-medium">{url}</div>
                      {result.status === 'success' ? (
                        <div className="text-green-600">
                          ✓ {result.statusCode} - {result.responseTime}ms
                          {result.data?.status && (
                            <div>Status: {result.data.status}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-600">
                          ✗ {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-border my-2" />

          <div className="text-xs text-muted-foreground">
            Última actualización: {debugInfo.connectionStatus.lastChecked.toLocaleTimeString()}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Presiona Ctrl+Shift+D para mostrar/ocultar
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionDebugPanel;