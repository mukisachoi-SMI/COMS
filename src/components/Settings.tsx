import React, { useState, useEffect } from 'react';
import { ChurchSession, Church, DonationType, Position, PositionStatus } from '../types';
import { supabase } from '../utils/supabase';
import { 
  Settings as SettingsIcon, 
  Church as ChurchIcon, 
  DollarSign, 
  Users, 
  Shield, 
  Save, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface SettingsProps {
  session: ChurchSession;
}

interface TabData {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

const Settings: React.FC<SettingsProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState('church');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 교회 정보 상태
  const [churchInfo, setChurchInfo] = useState<Partial<Church>>({
    church_name: session.churchName,
    email: session.email,
    church_address: '',
    church_phone: ''
  });

  // 헌금 종류 상태
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [newDonationType, setNewDonationType] = useState({ type_name: '', type_code: '' });

  // 직분 상태
  const [positions, setPositions] = useState<Position[]>([]);
  const [newPosition, setNewPosition] = useState({ position_name: '', position_code: '' });

  // 직분 상태 관리
  const [positionStatuses, setPositionStatuses] = useState<PositionStatus[]>([]);
  const [newPositionStatus, setNewPositionStatus] = useState({ 
    status_name: '', 
    status_code: '' 
  });

  const tabs: TabData[] = [
    { id: 'church', name: '교회 정보', icon: ChurchIcon },
    { id: 'donations', name: '헌금 종류', icon: DollarSign },
    { id: 'positions', name: '직분 관리', icon: Users },
    { id: 'statuses', name: '직분 상태', icon: Shield }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 기본 헌금 종류
      const defaultDonationTypes: DonationType[] = [
        {
          type_id: 'dt_001',
          church_id: session.churchId,
          type_name: '주정헌금',
          type_code: 'WEEKLY_OFFERING',
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          type_id: 'dt_002',
          church_id: session.churchId,
          type_name: '감사헌금',
          type_code: 'THANKSGIVING',
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          type_id: 'dt_003',
          church_id: session.churchId,
          type_name: '십일조',
          type_code: 'TITHE',
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          type_id: 'dt_004',
          church_id: session.churchId,
          type_name: '선교헌금',
          type_code: 'MISSION',
          is_active: true,
          sort_order: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          type_id: 'dt_005',
          church_id: session.churchId,
          type_name: '절기헌금',
          type_code: 'SEASONAL',
          is_active: true,
          sort_order: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          type_id: 'dt_006',
          church_id: session.churchId,
          type_name: '건축헌금',
          type_code: 'BUILDING',
          is_active: true,
          sort_order: 6,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          type_id: 'dt_007',
          church_id: session.churchId,
          type_name: '임직헌금',
          type_code: 'ORDINATION',
          is_active: true,
          sort_order: 7,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          type_id: 'dt_008',
          church_id: session.churchId,
          type_name: '장학헌금',
          type_code: 'SCHOLARSHIP',
          is_active: true,
          sort_order: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          type_id: 'dt_009',
          church_id: session.churchId,
          type_name: '주일헌금',
          type_code: 'SUNDAY_OFFERING',
          is_active: true,
          sort_order: 9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          type_id: 'dt_010',
          church_id: session.churchId,
          type_name: '목적헌금',
          type_code: 'PURPOSE_OFFERING',
          is_active: true,
          sort_order: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // 기본 직분 (단순하게)
      const defaultPositions: Position[] = [
        {
          position_id: 'pos_001',
          church_id: session.churchId,
          position_name: '목사',
          position_code: 'PASTOR',
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          position_id: 'pos_002',
          church_id: session.churchId,
          position_name: '부목사',
          position_code: 'ASSOC_PASTOR',
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          position_id: 'pos_003',
          church_id: session.churchId,
          position_name: '전도사',
          position_code: 'EVANGELIST',
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          position_id: 'pos_004',
          church_id: session.churchId,
          position_name: '장로',
          position_code: 'ELDER',
          is_active: true,
          sort_order: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          position_id: 'pos_005',
          church_id: session.churchId,
          position_name: '권사',
          position_code: 'DEACONESS',
          is_active: true,
          sort_order: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          position_id: 'pos_006',
          church_id: session.churchId,
          position_name: '안수집사',
          position_code: 'ORDAINED_DEACON',
          is_active: true,
          sort_order: 6,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          position_id: 'pos_007',
          church_id: session.churchId,
          position_name: '집사',
          position_code: 'DEACON',
          is_active: true,
          sort_order: 7,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          position_id: 'pos_008',
          church_id: session.churchId,
          position_name: '성도',
          position_code: 'MEMBER',
          is_active: true,
          sort_order: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // 기본 직분 상태
      const defaultPositionStatuses: PositionStatus[] = [
        {
          status_id: 'st_001',
          church_id: session.churchId,
          status_name: '시무',
          status_code: 'ACTIVE',
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          status_id: 'st_002',
          church_id: session.churchId,
          status_name: '은퇴',
          status_code: 'RETIRED',
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          status_id: 'st_003',
          church_id: session.churchId,
          status_name: '협동',
          status_code: 'ASSOCIATE',
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          status_id: 'st_004',
          church_id: session.churchId,
          status_name: '원로',
          status_code: 'EMERITUS',
          is_active: true,
          sort_order: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          status_id: 'st_005',
          church_id: session.churchId,
          status_name: '직원',
          status_code: 'STAFF',
          is_active: true,
          sort_order: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setDonationTypes(defaultDonationTypes);
      setPositions(defaultPositions);
      setPositionStatuses(defaultPositionStatuses);

    } catch (error) {
      console.error('Failed to load initial data:', error);
      showMessage('error', '초기 데이터 로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveChurchInfo = async () => {
    setIsLoading(true);
    try {
      console.log('Saving church info:', churchInfo);
      // 실제로는 localStorage나 API에 저장
      showMessage('success', '교회 정보가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save church info:', error);
      showMessage('error', '교회 정보 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const addDonationType = () => {
    if (!newDonationType.type_name.trim()) {
      showMessage('error', '헌금 종류명을 입력해주세요.');
      return;
    }

    const donationType: DonationType = {
      type_id: `dt_${Date.now()}`,
      church_id: session.churchId,
      type_name: newDonationType.type_name.trim(),
      type_code: newDonationType.type_code.trim() || newDonationType.type_name.toUpperCase(),
      is_active: true,
      sort_order: donationTypes.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setDonationTypes([...donationTypes, donationType]);
    setNewDonationType({ type_name: '', type_code: '' });
    showMessage('success', '헌금 종류가 추가되었습니다.');
  };

  const removeDonationType = (typeId: string) => {
    if (window.confirm('이 헌금 종류를 삭제하시겠습니까?')) {
      setDonationTypes(donationTypes.filter(type => type.type_id !== typeId));
      showMessage('success', '헌금 종류가 삭제되었습니다.');
    }
  };

  const addPosition = () => {
    if (!newPosition.position_name.trim()) {
      showMessage('error', '직분명을 입력해주세요.');
      return;
    }

    const position: Position = {
      position_id: `pos_${Date.now()}`,
      church_id: session.churchId,
      position_name: newPosition.position_name.trim(),
      position_code: newPosition.position_code.trim() || newPosition.position_name.toUpperCase(),
      is_active: true,
      sort_order: positions.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setPositions([...positions, position]);
    setNewPosition({ position_name: '', position_code: '' });
    showMessage('success', '직분이 추가되었습니다.');
  };

  const removePosition = (positionId: string) => {
    if (window.confirm('이 직분을 삭제하시겠습니까?')) {
      setPositions(positions.filter(pos => pos.position_id !== positionId));
      showMessage('success', '직분이 삭제되었습니다.');
    }
  };

  const addPositionStatus = () => {
    if (!newPositionStatus.status_name.trim()) {
      showMessage('error', '직분 상태명을 입력해주세요.');
      return;
    }

    const status: PositionStatus = {
      status_id: `st_${Date.now()}`,
      church_id: session.churchId,
      status_name: newPositionStatus.status_name.trim(),
      status_code: newPositionStatus.status_code.trim() || newPositionStatus.status_name.toUpperCase(),
      is_active: true,
      sort_order: positionStatuses.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setPositionStatuses([...positionStatuses, status]);
    setNewPositionStatus({ status_name: '', status_code: '' });
    showMessage('success', '직분 상태가 추가되었습니다.');
  };

  const removePositionStatus = (statusId: string) => {
    if (window.confirm('이 직분 상태를 삭제하시겠습니까?')) {
      setPositionStatuses(positionStatuses.filter(status => status.status_id !== statusId));
      showMessage('success', '직분 상태가 삭제되었습니다.');
    }
  };

  const renderChurchInfo = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">교회 기본 정보</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              교회명
            </label>
            <input
              type="text"
              value={churchInfo.church_name || ''}
              onChange={(e) => setChurchInfo({...churchInfo, church_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="교회명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={churchInfo.email || ''}
              onChange={(e) => setChurchInfo({...churchInfo, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={churchInfo.church_phone || ''}
              onChange={(e) => setChurchInfo({...churchInfo, church_phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="전화번호를 입력하세요"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소
            </label>
            <input
              type="text"
              value={churchInfo.church_address || ''}
              onChange={(e) => setChurchInfo({...churchInfo, church_address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="교회 주소를 입력하세요"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={saveChurchInfo}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            저장
          </button>
        </div>
      </div>
    </div>
  );

  const renderPositionStatuses = () => (
    <div className="space-y-6">
      {/* 새 직분 상태 추가 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">직분 상태 추가</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직분 상태명
            </label>
            <input
              type="text"
              value={newPositionStatus.status_name}
              onChange={(e) => setNewPositionStatus({...newPositionStatus, status_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 임시"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코드 (선택)
            </label>
            <input
              type="text"
              value={newPositionStatus.status_code}
              onChange={(e) => setNewPositionStatus({...newPositionStatus, status_code: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: TEMPORARY"
            />
          </div>
        </div>

        <button
          onClick={addPositionStatus}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          추가
        </button>
      </div>

      {/* 기존 직분 상태 목록 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">현재 직분 상태 목록</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  직분 상태명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positionStatuses.map((status) => (
                <tr key={status.status_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {status.status_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {status.status_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      status.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {status.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removePositionStatus(status.status_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDonationTypes = () => (
    <div className="space-y-6">
      {/* 새 헌금 종류 추가 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">헌금 종류 추가</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              헌금 종류명
            </label>
            <input
              type="text"
              value={newDonationType.type_name}
              onChange={(e) => setNewDonationType({...newDonationType, type_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 특별헌금"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코드 (선택)
            </label>
            <input
              type="text"
              value={newDonationType.type_code}
              onChange={(e) => setNewDonationType({...newDonationType, type_code: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: SPECIAL"
            />
          </div>
        </div>

        <button
          onClick={addDonationType}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          추가
        </button>
      </div>

      {/* 기존 헌금 종류 목록 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">현재 헌금 종류</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  헌금 종류명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donationTypes.map((type) => (
                <tr key={type.type_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {type.type_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.type_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      type.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {type.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removeDonationType(type.type_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPositions = () => (
    <div className="space-y-6">
      {/* 새 직분 추가 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">직분 추가</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직분명
            </label>
            <input
              type="text"
              value={newPosition.position_name}
              onChange={(e) => setNewPosition({...newPosition, position_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 협동목사"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코드 (선택)
            </label>
            <input
              type="text"
              value={newPosition.position_code}
              onChange={(e) => setNewPosition({...newPosition, position_code: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: ASSOC_PASTOR"
            />
          </div>
        </div>

        <button
          onClick={addPosition}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          추가
        </button>
      </div>

      {/* 기존 직분 목록 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">현재 직분 목록</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  직분명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positions.map((position) => (
                <tr key={position.position_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {position.position_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {position.position_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      position.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {position.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removePosition(position.position_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* 메시지 알림 */}
      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'church' && renderChurchInfo()}
          {activeTab === 'donations' && renderDonationTypes()}
          {activeTab === 'positions' && renderPositions()}
          {activeTab === 'statuses' && renderPositionStatuses()}
        </>
      )}
    </div>
  );
};

export default Settings;