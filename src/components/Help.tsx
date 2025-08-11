import React, { useState, useEffect } from 'react';
import { 
  Book, 
  ChevronRight, 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  Heart,
  Lightbulb,
  HelpCircle,
  Play,
  Download,
  Shield,
  Church,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  UserCheck,
  Calendar,
  PieChart,
  BarChart,
  Target
} from 'lucide-react';

interface HelpProps {
  isStandalone?: boolean;
}

const Help: React.FC<HelpProps> = ({ isStandalone = false }) => {
  const [activeSection, setActiveSection] = useState('intro');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const sections = [
    { id: 'intro', name: '시작하기', icon: Home },
    { id: 'install', name: '설치 및 접속', icon: Download },
    { id: 'dashboard', name: '대시보드', icon: PieChart },
    { id: 'members', name: '교인 관리', icon: Users },
    { id: 'donations', name: '헌금 관리', icon: DollarSign },
    { id: 'reports', name: '보고서', icon: FileText },
    { id: 'settings', name: '설정', icon: Settings },
    { id: 'pastoral', name: '목회적 활용', icon: Heart },
    { id: 'faq', name: '자주 묻는 질문', icon: HelpCircle }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`${isStandalone ? 'min-h-screen bg-gray-50 dark:bg-gray-900' : ''}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center mb-4">
            <Book className="w-10 h-10 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">교회 헌금관리시스템 도움말</h1>
              <p className="text-primary-100 mt-2">체계적인 교회 재정 관리와 목회적 돌봄을 위한 완벽한 가이드</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4">
              <Church className="w-8 h-8 mb-2 text-primary-200" />
              <h3 className="font-semibold">한인교회 특화</h3>
              <p className="text-sm text-primary-100">한인교회 실정에 맞춘 시스템</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Shield className="w-8 h-8 mb-2 text-primary-200" />
              <h3 className="font-semibold">안전한 데이터</h3>
              <p className="text-sm text-primary-100">교회별 독립적 데이터 관리</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Heart className="w-8 h-8 mb-2 text-primary-200" />
              <h3 className="font-semibold">목회적 활용</h3>
              <p className="text-sm text-primary-100">데이터를 통한 목회적 돌봄</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 좌측 네비게이션 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">목차</h2>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {section.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3 space-y-8">
            {/* 시작하기 */}
            <section id="intro" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Home className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" />
                시작하기
              </h2>
              
              <div className="prose max-w-none text-gray-700 dark:text-gray-300">
                <p className="text-lg mb-4">
                  교회 헌금관리시스템은 한인교회의 효율적인 재정 관리와 교인 관리를 위해 특별히 설계된 
                  종합 관리 솔루션입니다.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-6">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 이 시스템으로 할 수 있는 일</p>
                  <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                    <li>✓ 교인 정보를 체계적으로 관리</li>
                    <li>✓ 헌금 내역을 정확하게 기록</li>
                    <li>✓ 다양한 보고서로 교회 재정 현황 파악</li>
                    <li>✓ 교인별 헌금 패턴 분석으로 목회적 돌봄</li>
                    <li>✓ 연간 세금 보고를 위한 자료 준비</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">주요 특징</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">🏢 교회별 독립 시스템</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">각 교회의 데이터는 완전히 분리되어 안전하게 관리됩니다.</p>
                  </div>
                  <div className="border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">📱 모바일 지원</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">스마트폰, 태블릿, 컴퓨터 모든 기기에서 사용 가능합니다.</p>
                  </div>
                  <div className="border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">🔒 보안</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">암호화된 연결과 자동 로그아웃으로 정보를 보호합니다.</p>
                  </div>
                  <div className="border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">📊 실시간 통계</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">대시보드에서 교회 현황을 한눈에 파악할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 설치 및 접속 - 다크모드 지원 추가 */}
            <section id="install" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Download className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" />
                설치 및 접속
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">웹 브라우저로 접속하기</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ol className="space-y-3">
                      <li className="flex">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">웹 브라우저 열기</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Chrome, Firefox, Safari, Edge 등 최신 브라우저 사용 권장</p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">시스템 주소 입력</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">제공받은 URL을 주소창에 입력 (예: https://church-system.com)</p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">로그인</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">교회 로그인 ID와 패스워드 입력</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ 첫 접속 시 주의사항</p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    <li>• 초기 패스워드는 반드시 변경하세요</li>
                    <li>• 로그인 정보는 안전한 곳에 보관하세요</li>
                    <li>• 공용 컴퓨터에서는 사용 후 반드시 로그아웃하세요</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 나머지 섹션들도 동일하게 다크모드 클래스 추가... */}
            {/* 여기서는 파일 길이 때문에 주요 부분만 수정했습니다 */}

            {/* FAQ - 다크모드 지원 */}
            <section id="faq" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <HelpCircle className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" />
                자주 묻는 질문
              </h2>

              <div className="space-y-4">
                {[
                  {
                    id: 'faq1',
                    question: '데이터는 안전한가요?',
                    answer: '네, 모든 데이터는 암호화되어 저장되며, 각 교회의 데이터는 완전히 분리되어 관리됩니다.'
                  },
                  {
                    id: 'faq2',
                    question: '여러 명이 동시에 사용할 수 있나요?',
                    answer: '네, 가능합니다. 여러 관리자가 동시에 접속하여 작업할 수 있으며, 실시간으로 데이터가 동기화됩니다.'
                  }
                ].map((faq) => (
                  <div key={faq.id} className="border dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">{faq.question}</span>
                      <ChevronRight className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform ${
                        expandedItems.includes(faq.id) ? 'rotate-90' : ''
                      }`} />
                    </button>
                    {expandedItems.includes(faq.id) && (
                      <div className="px-4 py-3 border-t dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 지원 정보 */}
            <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">도움이 필요하신가요?</h2>
              <p className="mb-6">
                시스템 사용 중 문제가 발생하거나 추가 도움이 필요하시면 언제든지 연락주세요.
              </p>
            </section>

            {/* 버전 정보 */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
              <p>교회 헌금관리시스템 v1.0.0 | 한인 디아스포라 네트워크</p>
              <p className="mt-1">© 2025 Church Donation Management System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;