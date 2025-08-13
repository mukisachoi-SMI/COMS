module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // 사용하지 않는 변수 경고 (에러가 아닌 경고로 설정)
    'no-unused-vars': 'off', // TypeScript에서 처리하도록 비활성화
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true
      }
    ],
    
    // React Hooks 의존성 배열 관련 경고 완화
    'react-hooks/exhaustive-deps': 'warn',
    
    // import 관련 규칙
    'import/no-unused-modules': 'off',
    'import/order': [
      'warn',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'never'
      }
    ],
    
    // 전역 객체 사용 제한 (필요시 주석으로 허용)
    'no-restricted-globals': ['error', 'confirm', 'alert', 'prompt'],
    
    // 콘솔 사용 허용 (개발 중이므로)
    'no-console': 'off',
    
    // JSX에서 빈 요소 허용
    'react/self-closing-comp': 'warn',
    
    // 사용하지 않는 import 경고
    'no-unused-imports': 'off', // 플러그인이 없으므로 비활성화
    
    // 특정 TypeScript 관련 경고 완화
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // React 관련 규칙
    'react/prop-types': 'off', // TypeScript 사용 시 불필요
    'react/display-name': 'off',
    
    // JSX 관련
    'react/jsx-no-target-blank': ['warn', { 'allowReferrer': true }],
    'react/jsx-key': 'warn'
  },
  
  // 특정 파일에 대한 설정 재정의
  overrides: [
    {
      files: ['**/*.test.{js,jsx,ts,tsx}'],
      rules: {
        // 테스트 파일에서는 더 관대한 규칙 적용
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off'
      }
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        // 타입 정의 파일에서는 사용하지 않는 import 허용
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ],
  
  // 환경 설정
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  
  // 파서 설정
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  
  settings: {
    react: {
      version: 'detect'
    }
  }
};
