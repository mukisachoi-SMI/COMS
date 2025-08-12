import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 초기 다크모드 상태 확인
    const checkDarkMode = () => {
      const darkModeClass = document.documentElement.classList.contains('dark');
      const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedMode = localStorage.getItem('darkMode');
      
      if (savedMode) {
        return savedMode === 'true';
      }
      return darkModeClass || systemDarkMode;
    };
    
    setIsDarkMode(checkDarkMode());
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      // iOS Safari를 위한 추가 처리
      document.documentElement.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#111827';
      document.body.style.color = '#f3f4f6';
    } else {
      document.documentElement.classList.remove('dark');
      // iOS Safari를 위한 추가 처리
      document.documentElement.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#111827';
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem('darkMode', String(newMode));
    
    // iOS Safari 강제 리플로우
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      document.body.style.display = 'none';
      void document.body.offsetHeight; // 리플로우 트리거
      document.body.style.display = '';
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label="다크모드 토글"
    >
      <div className="relative w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors">
        <div 
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
            isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        >
          <div className="flex items-center justify-center h-full">
            {isDarkMode ? (
              <Moon className="w-3 h-3 text-gray-700" />
            ) : (
              <Sun className="w-3 h-3 text-yellow-500" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default DarkModeToggle;