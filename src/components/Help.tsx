import React, { useState } from 'react';
import { 
  Book, 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  Heart,
  HelpCircle,
  Download,
  Shield,
  Church,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  PieChart
} from 'lucide-react';

interface HelpProps {
  isStandalone?: boolean;
}

const Help: React.FC<HelpProps> = ({ isStandalone = false }) => {
  const [activeSection, setActiveSection] = useState('intro');

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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center mb-4">
            <Book className="w-10 h-10 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">교회 헌금관리시스템 도움말</h1>
              <p className="text-indigo-100 mt-2">체계적인 교회 재정 관리와 목회적 돌봄을 위한 완벽한 가이드</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4">
              <Church className="w-8 h-8 mb-2 text-indigo-200" />
              <h3 className="font-semibold">한인교회 특화</h3>
              <p className="text-sm text-indigo-100">한인교회 실정에 맞춘 시스템</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Shield className="w-8 h-8 mb-2 text-indigo-200" />
              <h3 className="font-semibold">안전한 데이터</h3>
              <p className="text-sm text-indigo-100">교회별 독립적 데이터 관리</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Heart className="w-8 h-8 mb-2 text-indigo-200" />
              <h3 className="font-semibold">목회적 활용</h3>
              <p className="text-sm text-indigo-100">데이터를 통한 목회적 돌봄</p>
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
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
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
                <Home className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                시작하기
              </h2>
              
              <div className="prose max-w-none">
                <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
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
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">🏢 교회별 독립 시스템</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">각 교회의 데이터는 완전히 분리되어 안전하게 관리됩니다.</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">📱 모바일 지원</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">스마트폰, 태블릿, 컴퓨터 모든 기기에서 사용 가능합니다.</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">🔒 보안</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">암호화된 연결과 자동 로그아웃으로 정보를 보호합니다.</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">📊 실시간 통계</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">대시보드에서 교회 현황을 한눈에 파악할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 설치 및 접속 */}
            <section id="install" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Download className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                설치 및 접속
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">웹 브라우저로 접속하기</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ol className="space-y-3">
                      <li className="flex">
                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">웹 브라우저 열기</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Chrome, Firefox, Safari, Edge 등 최신 브라우저 사용 권장</p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">시스템 주소 입력</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">제공받은 URL을 주소창에 입력</p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">로그인</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">교회 로그인 ID와 패스워드 입력</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">모바일 앱처럼 설치하기 (PWA)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">📱 iPhone/iPad</h4>
                      <ol className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                        <li>1. Safari로 시스템 접속</li>
                        <li>2. 하단 공유 버튼 탭</li>
                        <li>3. "홈 화면에 추가" 선택</li>
                        <li>4. "추가" 탭</li>
                      </ol>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">🤖 Android</h4>
                      <ol className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                        <li>1. Chrome으로 시스템 접속</li>
                        <li>2. 우측 상단 메뉴(⋮) 탭</li>
                        <li>3. "홈 화면에 추가" 선택</li>
                        <li>4. "추가" 탭</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 대시보드 */}
            <section id="dashboard" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <PieChart className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                대시보드
              </h2>

              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  대시보드는 교회의 현황을 한눈에 파악할 수 있는 종합 현황판입니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📊 주요 통계 카드</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• 이번 달 총 헌금액</li>
                      <li>• 전월 대비 증감률</li>
                      <li>• 등록 교인 수</li>
                      <li>• 오늘의 헌금 현황</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">📈 차트와 그래프</h4>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>• 월별 헌금 추이 그래프</li>
                      <li>• 헌금 종류별 비율 차트</li>
                      <li>• 최근 6개월 트렌드</li>
                      <li>• 연간 성장 지표</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 교인 관리 */}
            <section id="members" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                교인 관리
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">교인 등록하기</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ol className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">기본 정보 입력</span>
                          <p className="text-sm text-gray-600 dark:text-gray-300">이름, 전화번호, 주소 등</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">직분 선택</span>
                          <p className="text-sm text-gray-600 dark:text-gray-300">목사, 장로, 권사, 집사 등</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">직분 상태 설정</span>
                          <p className="text-sm text-gray-600 dark:text-gray-300">시무, 은퇴, 협동 등</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4">
                  <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2">💡 목회 활용 팁</p>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    교인 상세 페이지에서 헌금 내역을 확인하여 신앙생활의 변화를 파악하고, 
                    필요한 목회적 돌봄을 제공할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 헌금 관리 */}
            <section id="donations" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                헌금 관리
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📝 일반 등록</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                      <li>• 교인 선택 또는 비교인 입력</li>
                      <li>• 헌금 종류 선택</li>
                      <li>• 금액 입력</li>
                      <li>• 날짜 및 메모 추가</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">⚡ 빠른 등록</h4>
                    <ul className="text-sm text-green-700 dark:text-green-200 space-y-1">
                      <li>• 자주 사용하는 헌금 종류</li>
                      <li>• 간단한 입력 인터페이스</li>
                      <li>• 모바일 최적화</li>
                      <li>• 연속 입력 가능</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">헌금 종류</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="bg-gray-100 dark:bg-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100">✝️ 주정헌금</div>
                    <div className="bg-gray-100 dark:bg-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100">🙏 감사헌금</div>
                    <div className="bg-gray-100 dark:bg-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100">💰 십일조</div>
                    <div className="bg-gray-100 dark:bg-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100">🌍 선교헌금</div>
                    <div className="bg-gray-100 dark:bg-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100">🎄 절기헌금</div>
                    <div className="bg-gray-100 dark:bg-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100">🏗️ 건축헌금</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 보고서 */}
            <section id="reports" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                보고서
              </h2>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                다양한 보고서를 통해 교회 재정 현황을 정확히 파악하고 미래를 계획할 수 있습니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">📊 월별 보고서</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">매월 헌금 총액, 종류별 내역, 전월 대비 증감</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">📈 연간 보고서</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">연간 재정 흐름과 성장 추이 분석</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">👥 교인별 보고서</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">개별 교인의 헌금 내역과 패턴</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">🥧 헌금 종류별 분석</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">헌금 종류별 비율과 추이</p>
                </div>
              </div>
            </section>

            {/* 설정 */}
            <section id="settings" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Settings className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                설정
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">🏛️ 교회 정보</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">교회명, 주소, 연락처, 로고 관리</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">💰 헌금 종류</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">교회 상황에 맞는 헌금 종류 설정</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">👤 직분 관리</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">교회 조직에 맞는 직분 설정</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">🔐 보안 설정</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">패스워드 변경 및 접근 권한</p>
                </div>
              </div>
            </section>

            {/* 목회적 활용 */}
            <section id="pastoral" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Heart className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                목회적 활용 방안
              </h2>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  💡 이 시스템은 단순한 헌금 기록을 넘어 목회적 돌봄의 도구로 활용될 수 있습니다
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  데이터는 차가운 숫자가 아니라 교인들의 신앙 여정을 보여주는 따뜻한 이야기입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">🙏 신앙 여정 이해</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    개인내역 보고서를 통해 교인의 신앙생활 패턴과 변화를 이해
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">💝 목회적 관심</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    헌금 패턴 변화를 통해 적절한 목회적 돌봄 제공
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">📈 교회 성장 분석</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    연간 보고서로 교회의 성장과 변화 분석
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">📅 효과적인 계획</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    헌금 추이 파악으로 사역과 재정 계획 수립
                  </p>
                </div>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 mt-6">
                <p className="text-purple-900 dark:text-purple-100 italic">
                  "다양한 보고서와 통계 기능은 교인들의 삶을 더 깊이 이해하고, 
                  교회 공동체를 더 건강하게 세워가는 데 도움이 됩니다."
                </p>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <HelpCircle className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
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
                    answer: '네, 여러 관리자가 동시에 접속하여 작업할 수 있으며, 실시간으로 데이터가 동기화됩니다.'
                  },
                  {
                    id: 'faq3',
                    question: '모바일에서도 사용할 수 있나요?',
                    answer: '네, 스마트폰, 태블릿 등 모든 기기에서 사용 가능합니다.'
                  },
                  {
                    id: 'faq4',
                    question: '연말 정산용 자료를 출력할 수 있나요?',
                    answer: '네, 교인별 연간 헌금 내역서를 생성하여 출력하거나 PDF로 저장할 수 있습니다.'
                  }
                ].map((faq) => (
                  <details key={faq.id} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                    <summary className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
                      {faq.question}
                    </summary>
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* 지원 정보 */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">도움이 필요하신가요?</h2>
              <p className="mb-6">
                시스템 사용 중 문제가 발생하거나 추가 도움이 필요하시면 언제든지 연락주세요.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-indigo-100">전화 문의</p>
                    <p className="font-semibold">1588-0000</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-indigo-100">이메일</p>
                    <p className="font-semibold">support@church.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-indigo-100">카카오톡</p>
                    <p className="font-semibold">@교회시스템</p>
                  </div>
                </div>
              </div>
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