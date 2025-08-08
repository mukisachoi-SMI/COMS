import React, { useState, useEffect } from 'react';
import { ChurchSession } from '../types';
import { supabase } from '../utils/supabase';
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  DollarSign,
  Printer,
  Search,
  Filter,
  ChevronRight,
  Receipt,
  BarChart3,
  FileSpreadsheet,
  CheckCircle,
  CreditCard,
  Award,
  FileCheck,
  ChevronDown
} from 'lucide-react';

interface ReportsProps {
  session: ChurchSession;
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  memberId: string;
  donationTypeId: string;
  reportType: 'donation_receipt' | 'monthly' | 'yearly' | 'member' | 'type';
  selectedMonth?: string; // YYYY-MM 형식
  selectedYear?: number; // 연간 보고서용 연도
}

interface WeeklyData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  total: number;
  count: number;
  donations: any[];
  dailyBreakdown: { [key: string]: number };
}

interface MonthlyReportData {
  month: string;
  count: number;
  total: number;
  weeklyData: WeeklyData[];
  donations: any[];
}

interface MonthlyDataForYear {
  month: number;
  monthName: string;
  count: number;
  total: number;
  donations: any[];
  weeklyAverage: number;
}

interface YearlyReportData {
  year: number;
  count: number;
  total: number;
  monthlyData: MonthlyDataForYear[];
  donations: any[];
  monthlyAverage: number;
}

interface DonationReceiptData {
  memberId: string;
  memberName: string;
  phone?: string;
  address?: string;
  totalAmount: number;
  period: string;
  donations: any[];
  donationCount: number;
}

const Reports: React.FC<ReportsProps> = ({ session }) => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // 연초
    endDate: new Date().toISOString().split('T')[0],
    memberId: '',
    donationTypeId: '',
    reportType: 'donation_receipt',
    selectedMonth: new Date().toISOString().split('T')[0].substring(0, 7), // 현재 월
    selectedYear: new Date().getFullYear() // 현재 연도
  });
  
  const [members, setMembers] = useState<any[]>([]);
  const [donationTypes, setDonationTypes] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<DonationReceiptData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showWeeklyDetails, setShowWeeklyDetails] = useState<string | null>(null);
  const [showMonthlyDetails, setShowMonthlyDetails] = useState<number | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [session.churchId]);

  // 연도 변경 시 날짜 필터 자동 업데이트
  useEffect(() => {
    if (filters.reportType === 'donation_receipt') {
      setFilters(prev => ({
        ...prev,
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`
      }));
    }
  }, [selectedYear, filters.reportType]);

  // 연간 보고서 선택 시 해당 연도의 날짜 범위 설정
  useEffect(() => {
    if (filters.reportType === 'yearly' && filters.selectedYear) {
      setFilters(prev => ({
        ...prev,
        startDate: `${filters.selectedYear}-01-01`,
        endDate: `${filters.selectedYear}-12-31`
      }));
    }
  }, [filters.selectedYear, filters.reportType]);

  // 월별 보고서 선택 시 해당 월의 날짜 범위 설정
  useEffect(() => {
    if (filters.reportType === 'monthly' && filters.selectedMonth) {
      const [year, month] = filters.selectedMonth.split('-').map(Number);
      // 해당 월의 첫째 날 (month는 1-12 값이므로 -1 필요)
      const firstDay = new Date(year, month - 1, 1);
      // 해당 월의 마지막 날 (다음 달의 0일 = 이번 달의 마지막 날)
      const lastDay = new Date(year, month, 0);
      
      // 날짜를 YYYY-MM-DD 형식으로 변환
      const formatDateString = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      setFilters(prev => ({
        ...prev,
        startDate: formatDateString(firstDay),
        endDate: formatDateString(lastDay)
      }));
    }
  }, [filters.selectedMonth, filters.reportType]);

  const loadInitialData = async () => {
    try {
      const [membersResult, typesResult] = await Promise.all([
        supabase
          .from('members')
          .select('member_id, member_name, phone, address')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .order('member_name'),
        
        supabase
          .from('donation_types')
          .select('type_id, type_name')
          .eq('church_id', session.churchId)
          .eq('is_active', true)
          .order('sort_order')
      ]);

      setMembers(membersResult.data || []);
      setDonationTypes(typesResult.data || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('donations')
        .select(`
          *,
          members (member_name, phone, address),
          donation_types (type_name)
        `)
        .eq('church_id', session.churchId)
        .eq('status', 'active')
        .gte('donation_date', filters.startDate)
        .lte('donation_date', filters.endDate);

      if (filters.memberId) {
        query = query.eq('member_id', filters.memberId);
      }

      if (filters.donationTypeId) {
        query = query.eq('donation_type_id', filters.donationTypeId);
      }

      const { data, error } = await query.order('donation_date', { ascending: false });

      if (error) throw error;

      // 리포트 데이터 처리
      if (filters.reportType === 'donation_receipt') {
        const processedData = processDonationReceipts(data || []);
        setReceiptData(processedData);
      } else {
        const processedData = processReportData(data || [], filters.reportType);
        setReportData(processedData);
      }

    } catch (error) {
      console.error('Report generation error:', error);
      alert('보고서 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 기부금 영수증용 데이터 처리
  const processDonationReceipts = (data: any[]): DonationReceiptData[] => {
    const memberMap = new Map<string, DonationReceiptData>();
    
    data.forEach(donation => {
      const memberKey = donation.member_id || donation.donor_name || '익명';
      const memberName = donation.members?.member_name || donation.donor_name || '익명';
      
      if (!memberMap.has(memberKey)) {
        memberMap.set(memberKey, {
          memberId: donation.member_id || memberKey,
          memberName,
          phone: donation.members?.phone,
          address: donation.members?.address,
          totalAmount: 0,
          period: `${filters.startDate} ~ ${filters.endDate}`,
          donations: [],
          donationCount: 0
        });
      }
      
      const member = memberMap.get(memberKey)!;
      member.totalAmount += donation.amount;
      member.donationCount += 1;
      member.donations.push(donation);
    });

    return Array.from(memberMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const processReportData = (data: any[], reportType: string) => {
    switch (reportType) {
      case 'monthly':
        return processMonthlyReport(data);
      case 'yearly':
        return processYearlyReport(data);
      case 'member':
        return processMemberReport(data);
      case 'type':
        return processTypeReport(data);
      default:
        return data;
    }
  };

  const getWeekNumber = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return Math.ceil((dayOfMonth + startingDayOfWeek) / 7);
  };

  const getWeekDateRange = (year: number, month: number, weekNumber: number) => {
    // month는 1-12 값이므로 Date 생성 시 -1 필요
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0); // 다음 달의 0일 = 이번 달의 마지막 날
    const startingDayOfWeek = firstDay.getDay(); // 0 = 일요일, 6 = 토요일
    
    // 주차의 시작일과 종료일 계산
    let weekStart = new Date(year, month - 1, (weekNumber - 1) * 7 - startingDayOfWeek + 1);
    let weekEnd = new Date(year, month - 1, weekNumber * 7 - startingDayOfWeek);
    
    // 월의 경계를 벗어나지 않도록 조정
    if (weekStart.getTime() < firstDay.getTime()) {
      weekStart = new Date(firstDay);
    }
    if (weekEnd.getTime() > lastDay.getTime()) {
      weekEnd = new Date(lastDay);
    }
    
    // YYYY-MM-DD 형식으로 변환
    const formatDateString = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    return {
      start: formatDateString(weekStart),
      end: formatDateString(weekEnd)
    };
  };

  const processMonthlyReport = (data: any[]): MonthlyReportData => {
    if (!filters.selectedMonth) return { month: '', count: 0, total: 0, weeklyData: [], donations: [] };
    
    const [year, month] = filters.selectedMonth.split('-').map(Number);
    
    const monthlyData: MonthlyReportData = {
      month: filters.selectedMonth,
      count: 0,
      total: 0,
      weeklyData: [],
      donations: data
    };
    
    // 주간별 데이터 초기화 (최대 5주)
    const weeksInMonth = 5;
    const weeklyMap = new Map<number, WeeklyData>();
    
    for (let week = 1; week <= weeksInMonth; week++) {
      const weekRange = getWeekDateRange(year, month, week);
      weeklyMap.set(week, {
        weekNumber: week,
        startDate: weekRange.start,
        endDate: weekRange.end,
        total: 0,
        count: 0,
        donations: [],
        dailyBreakdown: {}
      });
    }
    
    // 헌금 데이터를 주간별로 분류
    data.forEach(donation => {
      const donationDate = new Date(donation.donation_date);
      const weekNum = getWeekNumber(donationDate);
      const weekData = weeklyMap.get(weekNum);
      
      if (weekData) {
        weekData.count++;
        weekData.total += donation.amount;
        weekData.donations.push(donation);
        
        // 일별 집계
        const dateKey = donation.donation_date;
        if (!weekData.dailyBreakdown[dateKey]) {
          weekData.dailyBreakdown[dateKey] = 0;
        }
        weekData.dailyBreakdown[dateKey] += donation.amount;
      }
      
      monthlyData.count++;
      monthlyData.total += donation.amount;
    });
    
    // 빈 주 제거하고 정렬
    monthlyData.weeklyData = Array.from(weeklyMap.values())
      .filter(week => week.count > 0)
      .sort((a, b) => a.weekNumber - b.weekNumber);
    
    return monthlyData;
  };

  const processYearlyReport = (data: any[]): YearlyReportData => {
    if (!filters.selectedYear) return { year: 0, count: 0, total: 0, monthlyData: [], donations: [], monthlyAverage: 0 };
    
    const yearlyData: YearlyReportData = {
      year: filters.selectedYear,
      count: 0,
      total: 0,
      monthlyData: [],
      donations: data,
      monthlyAverage: 0
    };
    
    // 월별 데이터 초기화 (1-12월)
    const monthlyMap = new Map<number, MonthlyDataForYear>();
    const monthNames = [
      '작년', '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    for (let month = 1; month <= 12; month++) {
      monthlyMap.set(month, {
        month,
        monthName: monthNames[month],
        count: 0,
        total: 0,
        donations: [],
        weeklyAverage: 0
      });
    }
    
    // 헌금 데이터를 월별로 분류
    data.forEach(donation => {
      const donationDate = new Date(donation.donation_date);
      const month = donationDate.getMonth() + 1; // 0-11 -> 1-12
      const monthData = monthlyMap.get(month);
      
      if (monthData) {
        monthData.count++;
        monthData.total += donation.amount;
        monthData.donations.push(donation);
      }
      
      yearlyData.count++;
      yearlyData.total += donation.amount;
    });
    
    // 월별 평균 계산 및 정렬
    yearlyData.monthlyData = Array.from(monthlyMap.values())
      .map(month => {
        // 각 월의 주간 평균 계산 (약 4주로 가정)
        month.weeklyAverage = month.total / 4;
        return month;
      })
      .sort((a, b) => a.month - b.month);
    
    // 연간 월 평균 계산
    const monthsWithData = yearlyData.monthlyData.filter(m => m.count > 0).length;
    yearlyData.monthlyAverage = monthsWithData > 0 ? yearlyData.total / monthsWithData : 0;
    
    return yearlyData;
  };

  const processMemberReport = (data: any[]) => {
    const memberData: { [key: string]: any } = {};
    
    data.forEach(donation => {
      const memberKey = donation.member_id || donation.donor_name || '익명';
      const memberName = donation.members?.member_name || donation.donor_name || '익명';
      
      if (!memberData[memberKey]) {
        memberData[memberKey] = {
          memberId: donation.member_id,
          memberName,
          count: 0,
          total: 0,
          donations: []
        };
      }
      memberData[memberKey].count++;
      memberData[memberKey].total += donation.amount;
      memberData[memberKey].donations.push(donation);
    });

    return Object.values(memberData).sort((a, b) => b.total - a.total);
  };

  const processTypeReport = (data: any[]) => {
    const typeData: { [key: string]: any } = {};
    
    data.forEach(donation => {
      const typeId = donation.donation_type_id;
      const typeName = donation.donation_types?.type_name || '기타';
      
      if (!typeData[typeId]) {
        typeData[typeId] = {
          typeId,
          typeName,
          count: 0,
          total: 0,
          donations: []
        };
      }
      typeData[typeId].count++;
      typeData[typeId].total += donation.amount;
      typeData[typeId].donations.push(donation);
    });

    return Object.values(typeData).sort((a, b) => b.total - a.total);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 기부금 영수증 출력 (기간 합계)
  const printDonationReceipt = (receipt: DonationReceiptData) => {
    const printWindow = window.open('', '', 'width=600,height=800');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>기부금 영수증</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: 'Malgun Gothic', sans-serif; 
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 210mm;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px double #000;
          }
          .receipt-number {
            text-align: right;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .title { 
            font-size: 28px; 
            font-weight: bold;
            margin: 20px 0;
            letter-spacing: 10px;
          }
          .church-info {
            margin-top: 15px;
            font-size: 14px;
          }
          .content { 
            margin: 40px 0; 
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
          }
          .info-table td {
            padding: 12px;
            border: 1px solid #333;
            font-size: 14px;
          }
          .info-table .label {
            width: 30%;
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
          }
          .info-table .value {
            padding-left: 20px;
          }
          .amount-box {
            margin: 40px 0;
            padding: 20px;
            background-color: #f9f9f9;
            border: 2px solid #333;
            text-align: center;
          }
          .amount-label {
            font-size: 16px;
            margin-bottom: 10px;
          }
          .amount-value {
            font-size: 24px;
            font-weight: bold;
            color: #000;
          }
          .purpose {
            margin: 30px 0;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
          }
          .purpose-title {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .signature {
            margin-top: 60px;
            text-align: center;
          }
          .signature-date {
            margin-bottom: 40px;
            font-size: 16px;
          }
          .signature-church {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .signature-line {
            display: inline-block;
            width: 200px;
            border-bottom: 1px solid #000;
            margin: 0 10px;
          }
          .seal-area {
            display: inline-block;
            width: 60px;
            height: 60px;
            border: 2px solid #333;
            border-radius: 50%;
            margin-left: 20px;
            vertical-align: middle;
            text-align: center;
            line-height: 56px;
            font-size: 12px;
            color: #999;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          @media print {
            body { margin: 0; }
            .container { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="receipt-number">
            No. ${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}
          </div>
          
          <div class="header">
            <div class="title">기 부 금 영 수 증</div>
            <div class="church-info">
              <strong>${session.churchName}</strong>
            </div>
          </div>
          
          <div class="content">
            <table class="info-table">
              <tr>
                <td class="label">성명 (단체명)</td>
                <td class="value">${receipt.memberName}</td>
              </tr>
              <tr>
                <td class="label">주소</td>
                <td class="value">${receipt.address || '-'}</td>
              </tr>
              <tr>
                <td class="label">전화번호</td>
                <td class="value">${receipt.phone || '-'}</td>
              </tr>
              <tr>
                <td class="label">기부 기간</td>
                <td class="value">${receipt.period}</td>
              </tr>
              <tr>
                <td class="label">기부 건수</td>
                <td class="value">${receipt.donationCount}건</td>
              </tr>
            </table>
            
            <div class="amount-box">
              <div class="amount-label">기부금 총액</div>
              <div class="amount-value">${formatCurrency(receipt.totalAmount)}</div>
            </div>
            
            <div class="purpose">
              <div class="purpose-title">기부 목적</div>
              <div>종교단체 기부금 (소득세법 제34조 및 법인세법 제24조)</div>
            </div>
          </div>
          
          <div class="signature">
            <div class="signature-date">
              발행일자: ${new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <p style="margin: 30px 0;">
              위와 같이 기부금을 영수하였음을 증명합니다.
            </p>
            
            <div style="margin-top: 40px;">
              <div class="signature-church">${session.churchName}</div>
              <div style="margin-top: 20px;">
                <span>담임목사</span>
                <span class="signature-line"></span>
                <span class="seal-area">인</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>* 이 영수증은 소득공제용으로 사용하실 수 있습니다.</p>
            <p>* 문의: ${session.churchName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // 전체 기부금 영수증 일괄 출력
  const printAllReceipts = () => {
    if (receiptData.length === 0) return;
    
    const printWindow = window.open('', '', 'width=600,height=800');
    if (!printWindow) return;

    let allReceiptsHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>기부금 영수증 일괄 출력</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: 'Malgun Gothic', sans-serif; 
            margin: 0;
          }
          .page {
            page-break-after: always;
            padding: 20px;
          }
          .page:last-child {
            page-break-after: auto;
          }
          /* 영수증 스타일은 동일하게 적용 */
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px double #000; }
          .title { font-size: 28px; font-weight: bold; margin: 20px 0; letter-spacing: 10px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .info-table td { padding: 12px; border: 1px solid #333; font-size: 14px; }
          .info-table .label { width: 30%; background-color: #f5f5f5; font-weight: bold; text-align: center; }
          .amount-box { margin: 40px 0; padding: 20px; background-color: #f9f9f9; border: 2px solid #333; text-align: center; }
          .amount-value { font-size: 24px; font-weight: bold; }
        </style>
      </head>
      <body>
    `;

    receiptData.forEach((receipt, index) => {
      allReceiptsHTML += `
        <div class="page">
          <div class="header">
            <div class="title">기 부 금 영 수 증</div>
            <div>${session.churchName}</div>
          </div>
          
          <table class="info-table">
            <tr>
              <td class="label">성명</td>
              <td>${receipt.memberName}</td>
            </tr>
            <tr>
              <td class="label">기부 기간</td>
              <td>${receipt.period}</td>
            </tr>
            <tr>
              <td class="label">기부 건수</td>
              <td>${receipt.donationCount}건</td>
            </tr>
          </table>
          
          <div class="amount-box">
            <div>기부금 총액</div>
            <div class="amount-value">${formatCurrency(receipt.totalAmount)}</div>
          </div>
          
          <div style="text-align: center; margin-top: 50px;">
            <p>위와 같이 기부금을 영수하였음을 증명합니다.</p>
            <p style="margin-top: 30px;">${new Date().toLocaleDateString('ko-KR')}</p>
            <p style="margin-top: 30px; font-weight: bold;">${session.churchName}</p>
          </div>
        </div>
      `;
    });

    allReceiptsHTML += `
      </body>
      </html>
    `;

    printWindow.document.write(allReceiptsHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const downloadCSV = () => {
    if (!reportData) return;

    let csvContent = '\uFEFF'; // BOM for Excel UTF-8
    
    // reportType에 따라 다른 CSV 생성
    if (filters.reportType === 'monthly') {
      const data = reportData as MonthlyReportData;
      csvContent += '주차,기간,건수,금액\n';
      data.weeklyData.forEach(week => {
        csvContent += `${week.weekNumber}주차,`;
        csvContent += `${week.startDate} ~ ${week.endDate},`;
        csvContent += `${week.count},`;
        csvContent += `${week.total}\n`;
      });
      
      csvContent += '\n날짜,헌금자,헌금종류,금액,헌금방법,비고\n';
      data.donations.forEach((donation: any) => {
        csvContent += `${donation.donation_date},`;
        csvContent += `${donation.members?.member_name || donation.donor_name || '익명'},`;
        csvContent += `${donation.donation_types?.type_name || '기타'},`;
        csvContent += `${donation.amount},`;
        csvContent += `${donation.payment_method || ''},`;
        csvContent += `${donation.notes || ''}\n`;
      });
    } else if (filters.reportType === 'yearly') {
      const data = reportData as YearlyReportData;
      csvContent += '월,건수,금액,주간평균\n';
      data.monthlyData.forEach(month => {
        csvContent += `${month.monthName},`;
        csvContent += `${month.count},`;
        csvContent += `${month.total},`;
        csvContent += `${month.weeklyAverage}\n`;
      });
      
      csvContent += '\n날짜,헌금자,헌금종류,금액,헌금방법,비고\n';
      data.donations.forEach((donation: any) => {
        csvContent += `${donation.donation_date},`;
        csvContent += `${donation.members?.member_name || donation.donor_name || '익명'},`;
        csvContent += `${donation.donation_types?.type_name || '기타'},`;
        csvContent += `${donation.amount},`;
        csvContent += `${donation.payment_method || ''},`;
        csvContent += `${donation.notes || ''}\n`;
      });
    } else if (Array.isArray(reportData)) {
      // 기존 다른 보고서 타입 처리
      csvContent += '날짜,헌꺈자,헌금종류,금액,헌금방법,비고\n';
      reportData.forEach((item: any) => {
        if (item.donations) {
          item.donations.forEach((donation: any) => {
            csvContent += `${donation.donation_date},`;
            csvContent += `${donation.members?.member_name || donation.donor_name || '익명'},`;
            csvContent += `${donation.donation_types?.type_name || '기타'},`;
            csvContent += `${donation.amount},`;
            csvContent += `${donation.payment_method || ''},`;
            csvContent += `${donation.notes || ''}\n`;
          });
        }
      });
    }

    // 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `헌금보고서_${filters.reportType}_${filters.startDate}_${filters.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">보고서</h2>
            <p className="text-gray-600">헌금 보고서 생성 및 기부금 영수증 발급</p>
          </div>
        </div>
      </div>

      {/* 보고서 종류 선택 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">보고서 종류 선택</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { value: 'donation_receipt', label: '기부금 영수증', icon: CreditCard },
            { value: 'monthly', label: '월별 보고서', icon: Calendar },
            { value: 'yearly', label: '연간 보고서', icon: BarChart3 },
            { value: 'member', label: '교인별 보고서', icon: Users },
            { value: 'type', label: '헌금종류별', icon: FileSpreadsheet }
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setFilters({...filters, reportType: type.value as any})}
              className={`p-4 border rounded-lg transition-all ${
                filters.reportType === type.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <type.icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">{type.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 필터 설정 */}
      <div className="card">
      <div className="card-header">
      <h3 className="text-lg font-medium">조건 설정</h3>
      </div>
      
      {/* 연간 보고서용 연도 선택 */}
      {filters.reportType === 'yearly' && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            조회할 연도 선택
          </label>
          <select
            value={filters.selectedYear}
            onChange={(e) => setFilters({...filters, selectedYear: Number(e.target.value)})}
            className="input max-w-xs"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}년
                </option>
              );
            })}
          </select>
          <p className="mt-2 text-sm text-gray-600">
            * 선택한 연도의 1월부터 12월까지의 헌금 내역을 월별로 상세히 확인할 수 있습니다.
          </p>
        </div>
      )}
      
      {/* 월별 보고서용 연월 선택 */}
      {filters.reportType === 'monthly' && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              조회할 연월 선택
            </label>
            <input
              type="month"
              value={filters.selectedMonth}
              onChange={(e) => setFilters({...filters, selectedMonth: e.target.value})}
              className="input max-w-xs"
            />
            <p className="mt-2 text-sm text-gray-600">
              * 선택한 월의 1일부터 마지막일까지의 헌금 내역을 주간별로 상세히 확인할 수 있습니다.
            </p>
          </div>
        )}
        
        {/* 기부금 영수증용 연도 선택 */}
        {filters.reportType === 'donation_receipt' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              영수증 발급 연도
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input max-w-xs"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                );
              })}
            </select>
            <p className="mt-2 text-sm text-gray-600">
              * 선택한 연도의 전체 기부금을 합산하여 영수증을 발급합니다.
            </p>
          </div>
        )}
        
        {/* 교인별, 헌금종류별 보고서인 경우 날짜 범위 선택 표시 */}
        {(filters.reportType === 'member' || filters.reportType === 'type') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 날짜
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="input"
              />
            </div>
          </div>
        )}
        
        {/* 교인 선택과 헌금 종류 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              교인 선택 (선택사항)
            </label>
            <select
              value={filters.memberId}
              onChange={(e) => setFilters({...filters, memberId: e.target.value})}
              className="input"
            >
              <option value="">전체</option>
              {(members || []).map(member => (
                <option key={member.member_id} value={member.member_id}>
                  {member.member_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              헌금 종류 (선택사항)
            </label>
            <select
              value={filters.donationTypeId}
              onChange={(e) => setFilters({...filters, donationTypeId: e.target.value})}
              className="input"
            >
              <option value="">전체</option>
              {(donationTypes || []).map(type => (
                <option key={type.type_id} value={type.type_id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={generateReport}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner mr-2"></div>
                생성 중...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                보고서 생성
              </>
            )}
          </button>
        </div>
      </div>

      {/* 월별 보고서 결과 */}
      {filters.reportType === 'monthly' && reportData && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {filters.selectedMonth} 월별 보고서
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // 월별 CSV 다운로드
                  let csvContent = '\uFEFF';
                  csvContent += '주차,기간,건수,금액\n';
                  
                  const data = reportData as MonthlyReportData;
                  data.weeklyData.forEach(week => {
                    csvContent += `${week.weekNumber}주차,`;
                    csvContent += `${week.startDate} ~ ${week.endDate},`;
                    csvContent += `${week.count},`;
                    csvContent += `${week.total}\n`;
                  });
                  
                  csvContent += `\n일자별 상세\n`;
                  csvContent += '날짜,헌금자,헌금종류,금액,헌금방법,비고\n';
                  data.donations.forEach((donation: any) => {
                    csvContent += `${donation.donation_date},`;
                    csvContent += `${donation.members?.member_name || donation.donor_name || '익명'},`;
                    csvContent += `${donation.donation_types?.type_name || '기타'},`;
                    csvContent += `${donation.amount},`;
                    csvContent += `${donation.payment_method || ''},`;
                    csvContent += `${donation.notes || ''}\n`;
                  });
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `월별보고서_${filters.selectedMonth}.csv`);
                  link.click();
                }}
                className="btn btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 다운로드
              </button>
            </div>
          </div>
          
          {/* 월 전체 요약 */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">총 헌금 건수</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(reportData as MonthlyReportData).count}건
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">총 헌금 금액</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency((reportData as MonthlyReportData).total)}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">주간 평균</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    (reportData as MonthlyReportData).total / 
                    Math.max((reportData as MonthlyReportData).weeklyData.length, 1)
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* 주간별 요약 */}
          <div className="p-4">
            <h4 className="text-lg font-medium mb-4">주간별 헌금 현황</h4>
            <div className="space-y-3">
              {(reportData as MonthlyReportData).weeklyData.map(week => (
                <div key={week.weekNumber} className="border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setShowWeeklyDetails(
                      showWeeklyDetails === `week-${week.weekNumber}` 
                        ? null 
                        : `week-${week.weekNumber}`
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                          <span className="font-medium">{week.weekNumber}주차</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {week.startDate} ~ {week.endDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{week.count}건</div>
                          <div className="font-bold text-green-600">
                            {formatCurrency(week.total)}
                          </div>
                        </div>
                        <ChevronRight 
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            showWeeklyDetails === `week-${week.weekNumber}` ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* 주간 상세 정보 */}
                  {showWeeklyDetails === `week-${week.weekNumber}` && (
                    <div className="border-t bg-gray-50 p-4">
                      {/* 일별 집계 */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">일별 헌금 집계</h5>
                        <div className="grid grid-cols-7 gap-2">
                          {Object.entries(week.dailyBreakdown).map(([date, amount]) => (
                            <div key={date} className="bg-white p-2 rounded text-center">
                              <div className="text-xs text-gray-500">
                                {new Date(date).toLocaleDateString('ko-KR', { 
                                  month: 'numeric', 
                                  day: 'numeric',
                                  weekday: 'short'
                                })}
                              </div>
                              <div className="text-sm font-bold text-green-600">
                                {formatCurrency(amount as number)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* 상세 내역 테이블 */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">상세 헌금 내역</h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white rounded">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">날짜</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">헌금자</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">종류</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">금액</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">방법</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {week.donations.map((donation: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm">
                                    {formatDate(donation.donation_date)}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {donation.members?.member_name || donation.donor_name || '익명'}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {donation.donation_types?.type_name || '기타'}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-right font-medium">
                                    {formatCurrency(donation.amount)}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {donation.payment_method || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 연간 보고서 결과 */}
      {filters.reportType === 'yearly' && reportData && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {filters.selectedYear}년 연간 보고서
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // 연간 CSV 다운로드
                  let csvContent = '\uFEFF';
                  csvContent += '월,건수,금액,주간평균\n';
                  
                  const data = reportData as YearlyReportData;
                  data.monthlyData.forEach(month => {
                    csvContent += `${month.monthName},`;
                    csvContent += `${month.count},`;
                    csvContent += `${month.total},`;
                    csvContent += `${month.weeklyAverage}\n`;
                  });
                  
                  csvContent += `\n전체 상세\n`;
                  csvContent += '날짜,헌금자,헌금종류,금액,헌금방법,비고\n';
                  data.donations.forEach((donation: any) => {
                    csvContent += `${donation.donation_date},`;
                    csvContent += `${donation.members?.member_name || donation.donor_name || '익명'},`;
                    csvContent += `${donation.donation_types?.type_name || '기타'},`;
                    csvContent += `${donation.amount},`;
                    csvContent += `${donation.payment_method || ''},`;
                    csvContent += `${donation.notes || ''}\n`;
                  });
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `연간보고서_${filters.selectedYear}년.csv`);
                  link.click();
                }}
                className="btn btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 다운로드
              </button>
            </div>
          </div>
          
          {/* 연간 전체 요약 */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">총 헌금 건수</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(reportData as YearlyReportData).count}건
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">총 헌금 금액</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency((reportData as YearlyReportData).total)}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">월 평균</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency((reportData as YearlyReportData).monthlyAverage)}
                </div>
              </div>
            </div>
          </div>
          
          {/* 월별 현황 */}
          <div className="p-4">
            <h4 className="text-lg font-medium mb-4">월별 헌금 현황</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(reportData as YearlyReportData).monthlyData.map(month => (
                <div 
                  key={month.month} 
                  className="border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setShowMonthlyDetails(
                    showMonthlyDetails === month.month ? null : month.month
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                        <span className="font-medium text-lg">{month.monthName}</span>
                      </div>
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          showMonthlyDetails === month.month ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">건수:</span>
                        <span className="ml-2 font-medium">{month.count}건</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500">주평균:</span>
                        <span className="ml-2 font-medium">{formatCurrency(month.weeklyAverage)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">월 합계</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(month.total)}
                        </span>
                      </div>
                    </div>
                    
                    {/* 월별 프로그레스 바 */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (month.total / Math.max(...(reportData as YearlyReportData).monthlyData.map(m => m.total))) * 100,
                              100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* 월별 상세 정보 */}
                  {showMonthlyDetails === month.month && month.count > 0 && (
                    <div className="border-t bg-gray-50 p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">상세 헌금 내역 (최근 10건)</h5>
                      <div className="space-y-2">
                        {month.donations.slice(0, 10).map((donation: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded">
                            <div>
                              <span className="text-gray-600">{formatDate(donation.donation_date)}</span>
                              <span className="ml-2">{donation.members?.member_name || donation.donor_name || '익명'}</span>
                            </div>
                            <span className="font-medium">{formatCurrency(donation.amount)}</span>
                          </div>
                        ))}
                        {month.donations.length > 10 && (
                          <div className="text-center text-sm text-gray-500 pt-2">
                            외 {month.donations.length - 10}건 더...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 월별 차트 */}
            <div className="mt-6 p-4 bg-white border rounded-lg">
              <h5 className="text-lg font-medium mb-4">월별 헌금 추이</h5>
              <div className="h-64 flex items-end justify-between gap-2">
                {(reportData as YearlyReportData).monthlyData.map(month => {
                  const maxAmount = Math.max(...(reportData as YearlyReportData).monthlyData.map(m => m.total));
                  const heightPercent = maxAmount > 0 ? (month.total / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-1">
                        {month.count > 0 && formatCurrency(month.total).replace('₩', '')}
                      </div>
                      <div 
                        className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${heightPercent}%` }}
                        title={`${month.monthName}: ${formatCurrency(month.total)}`}
                      />
                      <div className="text-xs mt-1 text-gray-700">{month.month}월</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 기부금 영수증 결과 */}
      {filters.reportType === 'donation_receipt' && receiptData.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-medium">
              기부금 영수증 발급 대상 ({receiptData.length}명)
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={printAllReceipts}
                className="btn btn-secondary"
              >
                <Printer className="w-4 h-4 mr-2" />
                전체 일괄 출력
              </button>
              <button
                onClick={() => {
                  // CSV 다운로드
                  let csvContent = '\uFEFF';
                  csvContent += '성명,기간,기부건수,총액,발행일자\n';
                  receiptData.forEach(receipt => {
                    csvContent += `${receipt.memberName},`;
                    csvContent += `${receipt.period},`;
                    csvContent += `${receipt.donationCount},`;
                    csvContent += `${receipt.totalAmount},`;
                    csvContent += `${new Date().toLocaleDateString('ko-KR')}\n`;
                  });
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `기부금영수증_${selectedYear}년.csv`);
                  link.click();
                }}
                className="btn btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 다운로드
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>순번</th>
                  <th>성명</th>
                  <th>기간</th>
                  <th>기부 건수</th>
                  <th>기부금 총액</th>
                  <th>발행일자</th>
                  <th>영수증</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.map((receipt, index) => (
                  <tr key={receipt.memberId}>
                    <td className="text-center">{index + 1}</td>
                    <td className="font-medium">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {receipt.memberName}
                      </div>
                    </td>
                    <td className="text-center">{receipt.period}</td>
                    <td className="text-center">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {receipt.donationCount}건
                      </span>
                    </td>
                    <td className="font-bold text-green-600 text-right">
                      {formatCurrency(receipt.totalAmount)}
                    </td>
                    <td className="text-center">
                      {new Date().toLocaleDateString('ko-KR')}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => printDonationReceipt(receipt)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-md"
                        title="영수증 출력"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="font-bold text-right">합계</td>
                  <td className="text-center font-bold">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {receiptData.reduce((sum, r) => sum + r.donationCount, 0)}건
                    </span>
                  </td>
                  <td className="font-bold text-green-600 text-right">
                    {formatCurrency(receiptData.reduce((sum, r) => sum + r.totalAmount, 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;