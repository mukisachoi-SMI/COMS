// Supabase 연결 관리 및 최적화
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

// Singleton 패턴으로 단일 인스턴스 유지
class SupabaseManager {
  private static instance: SupabaseClient | null = null;
  private static subscriptions = new Map<string, any>();
  private static connectionCount = 0;
  private static maxConnections = 5; // 최대 동시 연결 제한

  static getInstance(): SupabaseClient {
    if (!this.instance) {
      this.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        },
        realtime: {
          params: {
            eventsPerSecond: 2 // 실시간 이벤트 제한
          }
        },
        db: {
          schema: 'public'
        }
      });
    }
    return this.instance;
  }

  // 실시간 구독 관리
  static subscribe(
    channelName: string,
    table: string,
    filter: any,
    callback: () => void
  ) {
    // 이미 구독 중이면 기존 구독 반환
    if (this.subscriptions.has(channelName)) {
      console.log(`Reusing existing subscription: ${channelName}`);
      return this.subscriptions.get(channelName);
    }

    // 최대 연결 수 체크
    if (this.connectionCount >= this.maxConnections) {
      console.warn(`Max connections reached (${this.maxConnections}). Skipping subscription.`);
      return null;
    }

    const subscription = this.instance!
      .channel(channelName)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table,
        ...filter 
      }, callback)
      .subscribe();

    this.subscriptions.set(channelName, subscription);
    this.connectionCount++;
    
    console.log(`Active subscriptions: ${this.connectionCount}`);
    return subscription;
  }

  // 구독 해제
  static unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
      this.connectionCount--;
      console.log(`Unsubscribed: ${channelName}. Active: ${this.connectionCount}`);
    }
  }

  // 모든 구독 해제
  static unsubscribeAll() {
    this.subscriptions.forEach((sub, name) => {
      sub.unsubscribe();
      console.log(`Unsubscribed: ${name}`);
    });
    this.subscriptions.clear();
    this.connectionCount = 0;
  }

  // 연결 상태 확인
  static getConnectionStatus() {
    return {
      activeSubscriptions: this.connectionCount,
      maxConnections: this.maxConnections,
      subscriptionNames: Array.from(this.subscriptions.keys())
    };
  }
}

// Export 단일 인스턴스
export const supabase = SupabaseManager.getInstance();
export const supabaseManager = SupabaseManager;

// 쿼리 재시도 로직
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      console.error(`Query attempt ${i + 1} failed:`, error.message);
      
      // 연결 관련 에러인 경우 대기 시간 증가
      if (error.message?.includes('connection') || 
          error.message?.includes('timeout')) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

// 배치 쿼리 실행
export async function batchQuery<T>(
  queries: Array<() => Promise<T>>,
  batchSize = 3
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(q => q()));
    results.push(...batchResults);
    
    // 배치 간 짧은 대기
    if (i + batchSize < queries.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// 쿼리 디바운싱
export function debounceQuery<T extends (...args: any[]) => any>(
  fn: T,
  delay = 500
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// 연결 모니터링
export function monitorConnection() {
  const status = supabaseManager.getConnectionStatus();
  
  if (status.activeSubscriptions > status.maxConnections * 0.8) {
    console.warn('⚠️ High connection usage:', status);
  }
  
  return status;
}

// 자동 정리 (메모리 누수 방지)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    supabaseManager.unsubscribeAll();
  });
}
