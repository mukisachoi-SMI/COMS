import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOS 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 이미 PWA로 실행 중인지 확인
    const isInStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);

    // 이미 설치되었거나 프롬프트를 이미 닫았으면 표시하지 않음
    const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (isInStandaloneMode || promptDismissed === 'true') {
      return;
    }

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // 첫 방문 후 3초 뒤에 프롬프트 표시
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS에서는 수동 설치 안내
    if (isIOSDevice && !isInStandaloneMode) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // 24시간 후 다시 표시
    setTimeout(() => {
      localStorage.removeItem('pwa-prompt-dismissed');
    }, 24 * 60 * 60 * 1000);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6" />
              <h3 className="font-semibold">앱으로 설치하기</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            홈 화면에 추가하면 앱처럼 빠르고 편리하게 사용할 수 있습니다!
          </p>

          {/* 장점 목록 */}
          <ul className="space-y-2 mb-4 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>오프라인에서도 사용 가능</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>빠른 실행과 부드러운 성능</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>홈 화면에서 바로 접근</span>
            </li>
          </ul>

          {/* iOS 설치 안내 */}
          {isIOS ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>iOS 설치 방법:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 space-y-1">
                <li>1. Safari 브라우저 하단의 공유 버튼 탭</li>
                <li>2. "홈 화면에 추가" 선택</li>
                <li>3. "추가" 버튼 탭</li>
              </ol>
            </div>
          ) : null}

          {/* 버튼 */}
          <div className="flex gap-2">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="flex-1 btn btn-primary touch-target"
              >
                <Download className="w-4 h-4 mr-2" />
                지금 설치
              </button>
            )}
            <button
              onClick={handleRemindLater}
              className="flex-1 btn btn-secondary touch-target"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

// 애니메이션을 위한 스타일 추가 (index.css에 추가해야 함)
const animationStyles = `
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`;