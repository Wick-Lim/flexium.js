import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // 루트 디렉토리의 테스트 파일들을 포함
    include: ['../../tests/unit/**/*.test.mjs'],
    
    // DOM 테스트를 위한 환경 설정
    environment: 'jsdom',
    
    // 전역 API 사용 (describe, it, expect 등)
    globals: true,
    
    // 테스트 타임아웃 10초 (무한 루프 방지)
    testTimeout: 10000,
    
    // 병렬 실행 설정
    pool: 'threads',
    
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
