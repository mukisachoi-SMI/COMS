import React, { useState } from 'react';
import { ChurchSession } from '../types';
import { login } from '../utils/auth';
import { Church, Users, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onLogin: (session: ChurchSession) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginId.trim() || !password.trim()) {
      setError('로그인 ID와 패스워드를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const session = await login(loginId.trim(), password);
      onLogin(session);
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const testAccounts = [
    { id: 'seoulcentral', name: '서울중앙교회', password: 'seoul2025!' },
    { id: 'busan1st', name: '부산성심교회', password: 'busan2025!' },
    { id: 'daegucentral', name: '대구믿음교회', password: 'daegu2025!' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Church className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            교회 헌금관리시스템
          </h1>
          <p className="text-gray-600">
            로그인하여 헌금 관리를 시작하세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="alert alert-error">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                {error}
              </div>
            )}

            {/* 로그인 ID */}
            <div>
              <label htmlFor="loginId" className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                로그인 ID
              </label>
              <input
                type="text"
                id="loginId"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="input"
                placeholder="예: seoulcentral"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* 패스워드 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                패스워드
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="패스워드를 입력하세요"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>
          </form>
        </div>

        {/* 테스트 계정 안내 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">테스트 계정</h3>
          <div className="space-y-2">
            {testAccounts.map((account) => (
              <div key={account.id} className="text-xs text-gray-600 flex justify-between items-center">
                <div>
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded mr-2">
                    {account.id}
                  </span>
                  <span>{account.name}</span>
                </div>
                <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {account.password}
                </code>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
            💡 <strong>훨씬 간단해졌습니다!</strong><br/>
            이제 기억하기 쉬운 패스워드를 직접 설정할 수 있습니다.
          </p>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>문의사항이 있으시면 시스템 관리자에게 연락하세요</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;