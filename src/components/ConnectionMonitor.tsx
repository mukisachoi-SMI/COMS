import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Database, RefreshCw, XCircle } from 'lucide-react';
import { supabaseManager, monitorConnection } from '../utils/supabaseOptimized';
import { supabase } from '../utils/supabase';

interface ConnectionStatus {
  activeSubscriptions: number;
  maxConnections: number;
  subscriptionNames: string[];
  dbStatus: 'connected' | 'disconnected' | 'error';
  lastChecked: Date;
}

const ConnectionMonitor: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    activeSubscriptions: 0,
    maxConnections: 5,
    subscriptionNames: [],
    dbStatus: 'connected',
    lastChecked: new Date()
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // 30초마다 체크
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Supabase Manager 상태 확인
      const managerStatus = monitorConnection();
      
      // DB 연결 테스트
      const { error } = await supabase
        .from('churches')
        .select('church_id')
        .limit(1);
      
      setStatus({
        ...managerStatus,
        dbStatus: error ? 'error' : 'connected',
        lastChecked: new Date()
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        dbStatus: 'disconnected',
        lastChecked: new Date()
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const clearSubscriptions = () => {
    supabaseManager.unsubscribeAll();
    checkConnection();
  };

  const getStatusColor = () => {
    if (status.dbStatus === 'error' || status.dbStatus === 'disconnected') return 'text-red-500';
    if (status.activeSubscriptions > status.maxConnections * 0.8) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (status.dbStatus === 'error' || status.dbStatus === 'disconnected') {
      return <XCircle className="w-5 h-5" />;
    }
    if (status.activeSubscriptions > status.maxConnections * 0.8) {
      return <AlertCircle className="w-5 h-5" />;
    }
    return <CheckCircle className="w-5 h-5" />;
  };

  const getUsagePercentage = () => {
    return (status.activeSubscriptions / status.maxConnections) * 100;
  };

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all ${
          getStatusColor().replace('text-', 'bg-').replace('500', '100')
        } hover:scale-110`}
        title="Connection Monitor"
      >
        <Database className={`w-6 h-6 ${getStatusColor()}`} />
        {status.activeSubscriptions > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {status.activeSubscriptions}
          </span>
        )}
      </button>

      {/* 모니터 패널 */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200">
          <div className="p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                DB Connection Monitor
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* 연결 상태 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Status</span>
              <div className={`flex items-center ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="ml-2 font-medium capitalize">{status.dbStatus}</span>
              </div>
            </div>

            {/* 활성 구독 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Subscriptions</span>
                <span className="text-sm font-medium">
                  {status.activeSubscriptions} / {status.maxConnections}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getUsagePercentage() > 80 ? 'bg-red-500' :
                    getUsagePercentage() > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${getUsagePercentage()}%` }}
                />
              </div>
            </div>

            {/* 구독 목록 */}
            {status.subscriptionNames.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Active Channels:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {status.subscriptionNames.map((name, index) => (
                    <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 마지막 체크 시간 */}
            <div className="text-xs text-gray-500">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </div>

            {/* 액션 버튼 */}
            <div className="flex space-x-2">
              <button
                onClick={checkConnection}
                disabled={isChecking}
                className="flex-1 btn btn-secondary text-sm"
              >
                {isChecking ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                Refresh
              </button>
              {status.activeSubscriptions > 0 && (
                <button
                  onClick={clearSubscriptions}
                  className="flex-1 btn btn-secondary text-sm text-red-600"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* 경고 메시지 */}
            {getUsagePercentage() > 80 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">High Connection Usage</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Consider refreshing the page or clearing unused subscriptions to improve performance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectionMonitor;