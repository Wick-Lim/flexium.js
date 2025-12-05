import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // 테스트 파일들 포함 (src 내부만)
    include: [
      'src/**/__tests__/*.test.ts',
    ],

    // 기본 제외 항목
    exclude: [
      '**/node_modules/**',
      '**/suspense.test.ts', // Temporarily excluded - tests pass but vitest hangs on cleanup
    ],

    // DOM 테스트를 위한 환경 설정
    environment: 'jsdom',

    // 전역 API 사용 (describe, it, expect 등)
    globals: true,

    // 테스트 타임아웃 10초 (무한 루프 방지)
    testTimeout: 10000,

    // 병렬 실행 설정 (forks가 Promise 처리에 더 안정적)
    pool: 'forks',
    
    // 빌드된 파일 대신 소스 코드를 직접 테스트하도록 별칭 설정
    alias: {
      // 테스트 파일들이 참조하는 dist 경로를 src로 리다이렉트
      '../../packages/flexium/dist/test-exports.mjs': path.resolve(__dirname, './src/test-exports.ts'),
      '../../packages/flexium/dist/index.mjs': path.resolve(__dirname, './src/index.ts'),
      'flexium/dom': path.resolve(__dirname, './src/dom.ts'),
      'flexium': path.resolve(__dirname, './src/index.ts'),
    }
  },
})
