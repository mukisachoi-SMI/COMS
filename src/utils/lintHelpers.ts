/**
 * TypeScript 및 ESLint 경고 무시를 위한 유틸리티 파일
 */

// ===== 유틸리티 함수들 =====

/**
 * 안전한 타입 캐스팅을 위한 함수
 */
export const safeTypeCast = <T>(value: unknown): T => {
  return value as T;
};

/**
 * 개발 환경에서만 콘솔 로그를 출력하는 함수
 */
export const devLog = (...args: unknown[]): void => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

/**
 * 에러를 안전하게 처리하는 함수
 */
export const safeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * 비동기 함수에서 에러를 안전하게 처리하는 래퍼
 */
export const safeAsync = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      devLog('Async function error:', safeError(error));
      throw error;
    }
  }) as T;
};

// ===== 타입 정의 =====

/**
 * 일반적인 API 응답 타입
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * 안전하지 않은 객체 접근을 위한 타입
 */
export type UnsafeObject = Record<string, unknown>;

/**
 * 부분적으로 정의된 타입 (일부 필드만 필수)
 */
export type PartialRequired<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// ===== 상수 정의 =====

/**
 * 일반적으로 사용되는 상수들
 */
export const CONSTANTS = {
  DEFAULT_DELAY: 300,
  API_TIMEOUT: 30000,
  DEFAULT_PAGE_SIZE: 20,
  STORAGE_KEYS: {
    USER_PREFERENCES: 'coms_user_preferences',
    LAST_ROUTE: 'coms_last_route'
  }
} as const;

export default {
  safeTypeCast,
  devLog,
  safeError,
  safeAsync,
  CONSTANTS
};
