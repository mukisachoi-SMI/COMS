import React, { useEffect, useState } from 'react';
import { testConnection } from '../utils/supabase';
import { CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';

const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('loading');
    setMessage('Supabase 연결 테스트 중...');
    
    try {
      const result = await testConnection();
      
      if (result.success) {
        setStatus('success');
        setMessage('Supabase 연결 성공!');
        setDetails({
          url: process.env.REACT_APP_SUPABASE_URL || 'Using default URL',
          hasKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
          environment: process.env.NODE_ENV,
          data: result.data
        });
      } else {
        setStatus('error');
        setMessage(`연결 실패: ${result.error}`);
        setDetails({
          error: result.error,
          url: process.env.REACT_APP_SUPABASE_URL || 'Using default URL',
          hasKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
          environment: process.env.NODE_ENV
        });
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`예외 발생: ${error.message}`);
      setDetails({ error: error.message });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className={`bg-white rounded-lg shadow-xl p-4 border-2 ${
        status === 'success' ? 'border-green-500' : 
        status === 'error' ? 'border-red-500' : 
        'border-blue-500'
      }`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {status === 'loading' && <Loader className="w-6 h-6 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
            {status === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Supabase 연결 상태</h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
            
            {details && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                  상세 정보 보기
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </details>
            )}
            
            {status === 'error' && (
              <div className="mt-3 space-y-2">
                <button 
                  onClick={checkConnection}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  재시도
                </button>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-semibold flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    체크리스트:
                  </p>
                  <ul className="ml-4 space-y-0.5">
                    <li>• Netlify 환경변수 설정 확인</li>
                    <li>• Supabase URL/Key 정확성 확인</li>
                    <li>• Supabase RLS 정책 확인</li>
                    <li>• CORS 설정 확인</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;