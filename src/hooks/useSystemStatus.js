import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';

export const useSystemStatus = (autoRefresh = true) => {
  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    database: 0,
    health: 0,
    status: 'loading',
    loading: true,
    timestamp: null,
    details: {
      active_connections: 0,
      uptime_hours: 0,
      total_docs: 0
    }
  });

  const fetchSystemStatus = useCallback(async () => {
    try {
      setSystemStatus(prev => ({ ...prev, loading: true }));
      
      const response = await adminService.getSystemStatus();
      
      if (response.status === "success") {
        setSystemStatus({
          cpu: response.data.cpu || 0,
          memory: response.data.memory || 0,
          database: response.data.database || 0,
          health: response.data.health || 0,
          status: response.data.status || 'unknown',
          loading: false,
          timestamp: response.data.timestamp,
          details: response.data.details || {
            active_connections: 0,
            uptime_hours: 0,
            total_docs: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
      setSystemStatus(prev => ({ ...prev, loading: false, status: 'error' }));
    }
  }, []);

  useEffect(() => {
    fetchSystemStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchSystemStatus, autoRefresh]);

  return {
    systemStatus,
    fetchSystemStatus,
    isLoading: systemStatus.loading,
  };
};