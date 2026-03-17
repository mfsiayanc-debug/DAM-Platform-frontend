import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import * as api from '../services/api';

export function ApiHealthIndicator() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const healthy = await api.checkHealth();
      setIsHealthy(healthy);
    } catch (_err) {
      setIsHealthy(false);
    }
  };

  if (isHealthy === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isHealthy ? (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <Wifi className="w-4 h-4" />
          <span className="text-sm">Connected</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">Disconnected</span>
        </div>
      )}
    </div>
  );
}
