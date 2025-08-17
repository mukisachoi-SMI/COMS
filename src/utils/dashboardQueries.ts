// 대시보드 쿼리 최적화 유틸리티
import { supabase } from './supabase';

interface DashboardQueryParams {
  churchId: string;
  startOfMonth: Date;
  startOfWeek: Date;
  startOfToday: Date;
}

// 통합 쿼리 - 단일 쿼리로 여러 데이터 가져오기
export async function getOptimizedDashboardData(params: DashboardQueryParams) {
  const { churchId, startOfMonth, startOfWeek, startOfToday } = params;
  
  try {
    // 1. 단일 쿼리로 모든 헌금 데이터 가져오기 (JOIN 활용)
    const { data: donations, error: donationError } = await supabase
      .from('donations')
      .select(`
        *,
        members!left (member_name, phone),
        donation_types!left (type_name)
      `)
      .eq('church_id', churchId)
      .eq('status', 'active')
      .gte('donation_date', startOfMonth.toISOString().split('T')[0])
      .order('donation_date', { ascending: false });

    if (donationError) throw donationError;

    // 2. 교인 수 (단일 쿼리)
    const { count: memberCount, error: memberError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('church_id', churchId)
      .eq('status', 'active');

    if (memberError) throw memberError;

    // 3. 클라이언트 사이드에서 데이터 집계
    const processedData = processDataLocally(
      donations || [],
      startOfMonth,
      startOfWeek,
      startOfToday
    );

    return {
      ...processedData,
      totalMembers: memberCount || 0
    };

  } catch (error) {
    console.error('Dashboard data error:', error);
    throw error;
  }
}

// 로컬에서 데이터 처리 (DB 부하 감소)
function processDataLocally(
  donations: any[],
  startOfMonth: Date,
  startOfWeek: Date,
  startOfToday: Date
) {
  const today = new Date();
  const todayStr = startOfToday.toISOString().split('T')[0];
  const weekStr = startOfWeek.toISOString().split('T')[0];
  
  let monthlyTotal = 0;
  let weeklyTotal = 0;
  let todayTotal = 0;
  
  const donorMap = new Map();
  const typeMap = new Map();
  const weeklyTrendMap = new Map();
  const recentDonations: any[] = [];
  
  // 단일 루프로 모든 집계 처리
  donations.forEach((donation, index) => {
    const donationDate = new Date(donation.donation_date);
    const amount = donation.amount;
    
    // 월별 합계
    monthlyTotal += amount;
    
    // 주별 합계
    if (donation.donation_date >= weekStr) {
      weeklyTotal += amount;
    }
    
    // 오늘 합계
    if (donation.donation_date === todayStr) {
      todayTotal += amount;
    }
    
    // TOP 헌금자 집계
    const donorKey = donation.member_id || donation.donor_name || '익명';
    const donorName = donation.members?.member_name || donation.donor_name || '익명';
    donorMap.set(donorKey, {
      name: donorName,
      amount: (donorMap.get(donorKey)?.amount || 0) + amount
    });
    
    // 헌금 종류별 집계
    const typeName = donation.donation_types?.type_name || '기타';
    const typeData = typeMap.get(typeName) || { amount: 0, count: 0 };
    typeData.amount += amount;
    typeData.count += 1;
    typeMap.set(typeName, typeData);
    
    // 주간 트렌드
    if (donation.donation_date >= weekStr) {
      const dayName = getDayName(donationDate);
      weeklyTrendMap.set(dayName, (weeklyTrendMap.get(dayName) || 0) + amount);
    }
    
    // 최근 헌금 (상위 10개만)
    if (index < 10) {
      recentDonations.push({
        id: donation.donation_id,
        date: donation.donation_date,
        name: donorName,
        type: typeName,
        amount: amount,
        time: new Date(donation.created_at).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      });
    }
  });
  
  // TOP 헌금자 정렬 및 상위 10명 추출
  const topDonors = Array.from(donorMap.entries())
    .map(([key, data]) => ({
      name: data.name,
      amount: data.amount,
      percentage: monthlyTotal > 0 ? (data.amount / monthlyTotal) * 100 : 0,
      trend: 'stable' as const
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
  
  // 헌금 종류별 데이터 정렬
  const donationByType = Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      amount: data.amount,
      count: data.count,
      color: '#3b82f6',
      percentage: monthlyTotal > 0 ? (data.amount / monthlyTotal) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
  
  // 주간 트렌드 데이터
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const weeklyTrend = weekDays.map(day => ({
    day,
    amount: weeklyTrendMap.get(day) || 0
  }));
  
  return {
    monthlyDonation: monthlyTotal,
    weeklyDonation: weeklyTotal,
    todayDonation: todayTotal,
    monthlyChange: 0, // 이전 달 데이터가 필요하면 별도 처리
    weeklyChange: 0,
    todayChange: 0,
    topDonors,
    recentDonations,
    donationByType,
    weeklyTrend,
    goalProgress: Math.min(100, (monthlyTotal / 10000000) * 100),
    monthlyGoal: 10000000
  };
}

function getDayName(date: Date): string {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  return weekDays[date.getDay()];
}

// 캐싱 레이어 추가
const cache = new Map();
const CACHE_DURATION = 60000; // 1분

export async function getCachedDashboardData(params: DashboardQueryParams) {
  const cacheKey = `${params.churchId}_${new Date().toISOString().split('T')[0]}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached dashboard data');
    return cached.data;
  }
  
  const data = await getOptimizedDashboardData(params);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  // 오래된 캐시 정리
  cache.forEach((value, key) => {
    if (Date.now() - value.timestamp > CACHE_DURATION * 2) {
      cache.delete(key);
    }
  });
  
  return data;
}
