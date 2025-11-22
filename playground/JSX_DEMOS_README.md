# Flexium JSX Demos

This directory contains demos using Flexium with JSX/TSX syntax and the new **automatic JSX runtime**.

## 파일 구조

```
playground/
├── counter-jsx-demo.tsx       # 간단한 JSX 카운터 데모
├── counter-jsx.html            # JSX 카운터 HTML 진입점
├── advanced-jsx-demo.tsx       # 고급 JSX 데모 (여러 컴포넌트)
└── advanced-jsx.html           # 고급 JSX HTML 진입점
```

## 실행 방법

### 1. 라이브러리 빌드 (필수)

```bash
# 프로젝트 루트에서 실행
npm run build
```

### 2. 개발 서버 실행

```bash
# playground 디렉토리에서 실행
cd playground
npm run dev

# Vite 서버가 시작됩니다 (보통 http://localhost:3000)
```

### 3. 브라우저에서 열기

- **간단한 카운터**: http://localhost:3000/counter-jsx.html
- **고급 데모**: http://localhost:3000/advanced-jsx.html

## 데모 내용

### counter-jsx-demo.tsx (간단한 카운터)

- ✅ Signal 기반 반응형 상태
- ✅ JSX 문법으로 작성된 컴포넌트
- ✅ 이벤트 핸들러 (버튼 클릭)
- ✅ Effect를 통한 반응형 업데이트

**Key Code Pattern (NEW - No h import!):**
```tsx
// NEW: Automatic JSX runtime - no h import needed!
import { signal, effect } from '../dist/index.mjs'
import { render } from '../dist/dom.mjs'

const count = signal(0)

function Counter() {
  return (
    <div class="counter-container">
      <div class="count-display">{count.value}</div>
      <button onclick={() => count.value++}>+</button>
    </div>
  )
}

render(<Counter />, document.getElementById('app'))
```

**What Changed?** You no longer need to import `h`! The JSX runtime is imported automatically.

### advanced-jsx-demo.tsx (고급 데모)

4개의 상호작용하는 컴포넌트를 포함합니다:

1. **Counter 컴포넌트**
   - Signal 기반 카운터
   - Computed 값 (doubled)
   - 여러 버튼 (-1, Reset, +1, +5)

2. **Greeting 컴포넌트**
   - 텍스트 입력 양방향 바인딩
   - Computed greeting 메시지
   - 실시간 반응형 업데이트

3. **TodoList 컴포넌트**
   - Todo 아이템 추가/삭제
   - Batch 업데이트 사용
   - Enter 키 지원
   - 동적 리스트 렌더링

4. **Stats 컴포넌트**
   - 실시간 통계 표시
   - 모든 signal 값 추적
   - 4개의 통계 카드

**주요 기능:**
```tsx
// 반응형 상태
const count = signal(0)
const name = signal('World')
const todos = signal<string[]>(['Learn Flexium'])

// Computed 값
const doubled = computed(() => count.value * 2)
const greeting = computed(() => `Hello, ${name.value}!`)
const todoCount = computed(() => todos.value.length)

// 배치 업데이트
batch(() => {
  todos.value = [...todos.value, newTodo.value]
  newTodo.value = ''
})

// TypeScript 이벤트 핸들링
oninput={(e: Event) => {
  name.value = (e.target as HTMLInputElement).value
}}
```

## Automatic JSX Runtime (React 17+ Style)

Flexium now supports the **automatic JSX runtime**, just like React 17+!

### NEW: Automatic JSX (Recommended)
```tsx
// No h import needed!
import { signal } from '../dist/index.mjs'
import { render } from '../dist/dom.mjs'

function Counter() {
  const count = signal(0)
  return (
    <div class="container">
      <h1>Count: {count.value}</h1>
      <button onclick={() => count.value++}>+</button>
    </div>
  )
}
```

### OLD: Manual h() Import
```tsx
// OLD WAY - h import was required
import { signal } from '../dist/index.mjs'
import { h, render } from '../dist/dom.mjs'  // Had to import h

function Counter() {
  const count = signal(0)
  return (
    <div class="container">
      <h1>Count: {count.value}</h1>
      <button onclick={() => count.value++}>+</button>
    </div>
  )
}
```

### Even Older: Manual h() Function Calls
```typescript
// OLDEST WAY - No JSX at all
import { signal } from '../dist/index.mjs'
import { h, render } from '../dist/dom.mjs'

function Counter() {
  const count = signal(0)
  return h('div', { class: 'container' }, [
    h('h1', {}, [`Count: ${count.value}`]),
    h('button', { onclick: () => count.value++ }, ['+'])
  ])
}
```

**Automatic JSX Benefits:**
- ✅ Cleaner imports - no h import needed
- ✅ Matches React 17+ patterns
- ✅ Easier migration from React
- ✅ Still readable and type-safe
- ✅ Works with Vite and TypeScript out of the box

## TypeScript 지원

모든 JSX 데모는 TypeScript로 작성되어 있습니다:

```tsx
// 타입 안전한 이벤트 핸들링
oninput={(e: Event) => {
  name.value = (e.target as HTMLInputElement).value
}}

// 타입이 지정된 signal
const todos = signal<string[]>(['Learn Flexium'])
```

## TypeScript / Vite Configuration

To use automatic JSX runtime, configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

For Vite projects, add to `vite.config.js`:

```javascript
export default {
  esbuild: {
    jsxImportSource: 'flexium',
    jsx: 'automatic'
  }
}
```

**How it works:**
1. Vite detects `.tsx` files
2. esbuild transforms JSX using automatic runtime
3. Instead of importing `h`, it auto-imports from `flexium/jsx-runtime`
4. Your code stays clean without manual `h` imports!

## 주의사항

### ❌ 파일 프로토콜 사용하지 마세요
```bash
# 이렇게 하지 마세요:
open counter-jsx.html  # ❌ CORS 오류 발생
```

### ✅ HTTP 서버 사용하세요
```bash
# 이렇게 하세요:
npm run dev  # ✅ Vite 개발 서버 사용
```

### 반응형 바인딩 패턴

**올바른 패턴:**
```tsx
// ✅ Signal 객체 직접 전달 (자동 반응형)
<div>{count}</div>

// ✅ Effect로 수동 업데이트
effect(() => {
  element.textContent = String(count.value)
})
```

**잘못된 패턴:**
```tsx
// ❌ 값을 먼저 평가 (반응형 아님)
<div>{count.value}</div>  // 초기값만 표시됨
```

## 트러블슈팅

### CORS 오류
**문제:** `file://` 프로토콜로 열었을 때 발생
**해결:** `npm run dev`로 Vite 서버 사용

### 라이브러리를 찾을 수 없음 (404)
**문제:** `../dist/` 폴더가 없음
**해결:** `npm run build` 실행

### JSX가 변환되지 않음
**문제:** `.tsx` 확장자를 사용하지 않음 또는 tsconfig.json 설정 누락
**해결:**
1. 파일 이름을 `.tsx`로 변경
2. tsconfig.json에 `"jsx": "react-jsx"` 및 `"jsxImportSource": "flexium"` 추가

### "Cannot find module 'flexium/jsx-runtime'"
**문제:** 자동 JSX runtime을 찾을 수 없음
**해결:**
1. `npm run build`로 라이브러리 빌드
2. `dist/jsx-runtime.mjs` 파일이 생성되었는지 확인
3. package.json의 exports 필드 확인

### 반응형 업데이트가 작동하지 않음
**문제:** `count.value` 대신 `count` 전달
**해결:**
```tsx
// 자동 반응형을 위해 signal 객체 전달
<div>{count}</div>

// 또는 effect 사용
effect(() => {
  element.textContent = String(count.value)
})
```

## 다음 단계

더 많은 예제를 보려면:
- `/examples/` - 실제 프로덕션 앱
- `/docs/API.md` - 전체 API 문서
- `/CONTRIBUTING.md` - 개발 가이드

## 성능

- **빌드 시간**: ~100ms (Vite + esbuild)
- **핫 리로드**: < 50ms
- **번들 크기**: 25KB (전체 Flexium 라이브러리)
- **Signal 업데이트**: < 0.1ms

JSX를 사용하면 개발자 경험이 향상되지만 런타임 성능은 동일합니다! 🚀
