# 성능 개선 분석 보고서 (V3)

> 작성일: 2024-12-19  
> 분석 범위: 전체 코드베이스 심층 분석

## 📊 프로젝트 개요

Flexium.js는 fine-grained reactive UI framework로, 이미 상당한 수준의 최적화가 적용되어 있습니다:
- ✅ 비트마스킹 (SubscriberFlags)
- ✅ 메모리 풀링 (LinkPool)
- ✅ Epoch 기반 버전 체크
- ✅ Doubly Linked List 구조
- ✅ nodeType enum (instanceof 대신)
- ✅ WeakMap 캐싱

## 🔍 발견된 주요 성능 개선점

### 1. ⚠️ **높은 우선순위** - State Proxy 반복 생성 최적화

**위치**: `packages/flexium/src/core/state.ts:293-424`

**문제점**:
```typescript
function createStateProxy<T>(sig: Signal<T> | Computed<T>): StateValue<T> {
  const target = () => sig.value
  const proxy = new Proxy(target, { ... })
  return proxy as StateValue<T>
}
```

- 매 `state()` 호출마다 새로운 Proxy 객체 생성
- Proxy의 `get` 트랩이 매번 실행되어 오버헤드 발생
- 객체/배열 접근 시 매번 `sig.value` 호출로 의존성 추적

**개선 방안**:
1. **Proxy 재사용**: 같은 signal에 대해 Proxy를 한 번만 생성하고 재사용
2. **Lazy tracking**: 객체 속성 접근 시 첫 접근 시에만 추적, 이후는 직접 접근
3. **Proxy 캐싱**: WeakMap을 사용하여 signal → proxy 매핑 캐싱

**예상 성능 향상**: 15-30% (객체 상태가 많을 때)

**구현 예시**:
```typescript
const proxyCache = new WeakMap<Signal<unknown> | Computed<unknown>, StateValue<unknown>>()

function createStateProxy<T>(sig: Signal<T> | Computed<T>): StateValue<T> {
  const cached = proxyCache.get(sig)
  if (cached) return cached as StateValue<T>
  
  const proxy = new Proxy(...)
  proxyCache.set(sig, proxy)
  return proxy
}
```

---

### 2. ⚠️ **높은 우선순위** - DOM 업데이트 배치 최적화

**위치**: `packages/flexium/src/renderers/dom/reactive.ts:128-183, 202-300`

**문제점**:
```typescript
const dispose = effect(() => {
  const value = sig.value
  // DOM 업데이트가 즉시 실행됨
  domRenderer.updateTextNode(currentNode, String(value))
})
```

- 각 signal 변경마다 즉시 DOM 업데이트 발생
- 여러 signal이 동시에 변경될 때 불필요한 DOM 조작 반복
- `reconcileArrays`가 매번 실행되어 오버헤드

**개선 방안**:
1. **DOM 업데이트 배치**: `requestAnimationFrame` 또는 microtask를 사용하여 DOM 업데이트를 배치
2. **변경 감지 최적화**: 실제 DOM 변경이 필요한 경우에만 업데이트
3. **Fragment 재사용**: DocumentFragment를 재사용하여 GC 압력 감소

**예상 성능 향상**: 20-40% (많은 DOM 업데이트가 있을 때)

**구현 예시**:
```typescript
let pendingDOMUpdates = new Set<Node>()
let isDOMUpdateScheduled = false

function scheduleDOMUpdate(node: Node) {
  pendingDOMUpdates.add(node)
  if (!isDOMUpdateScheduled) {
    isDOMUpdateScheduled = true
    queueMicrotask(() => {
      flushDOMUpdates()
      isDOMUpdateScheduled = false
    })
  }
}

function flushDOMUpdates() {
  for (const node of pendingDOMUpdates) {
    // 실제 DOM 업데이트 수행
  }
  pendingDOMUpdates.clear()
}
```

---

### 3. ⚠️ **중간 우선순위** - reconcileArrays 메모리 할당 최적화

**위치**: `packages/flexium/src/renderers/dom/reconcile.ts:15-121`

**문제점**:
```typescript
const keyToOldFNode = new Map<string | number | undefined, FNode>()
const seen = new Set<string | number | undefined>()
```

- 매번 새로운 Map과 Set 생성
- 큰 리스트에서 메모리 할당 오버헤드
- GC 압력 증가

**개선 방안**:
1. **객체 풀링**: Map과 Set을 재사용하는 풀 구현
2. **인라인 최적화**: 작은 리스트(5개 이하)는 별도 빠른 경로 사용
3. **메모리 사전 할당**: 예상 크기에 맞춰 Map/Set 초기 용량 설정

**예상 성능 향상**: 10-20% (큰 리스트 렌더링 시)

---

### 4. ⚠️ **중간 우선순위** - setupReactiveProps 중복 체크 제거

**위치**: `packages/flexium/src/renderers/dom/reactive.ts:495-549`

**문제점**:
```typescript
function setupReactiveProps(node, props) {
  for (const key in props) {
    if (key.startsWith('on')) continue  // 매번 체크
    if (isSignal(value)) { ... }
    if (typeof value === 'function') { ... }
  }
}
```

- `key.startsWith('on')` 체크가 매번 실행
- 이벤트 핸들러와 일반 props를 분리하여 처리하면 더 효율적

**개선 방안**:
1. **Props 분리**: 이벤트 핸들러와 일반 props를 미리 분리
2. **빠른 경로**: 이벤트 핸들러만 있는 경우 빠른 경로 사용
3. **캐싱**: `startsWith` 결과를 캐싱 (하지만 효과는 미미할 수 있음)

**예상 성능 향상**: 3-5% (많은 props가 있을 때)

---

### 5. ⚠️ **중간 우선순위** - Effect cleanup 배열 최적화

**위치**: `packages/flexium/src/core/effect.ts:58-65`

**문제점**:
```typescript
private run(): void {
  if (this.cleanups.length > 0) {
    for (const cleanup of this.cleanups) {
      cleanup()
    }
    this.cleanups = []
  }
}
```

- cleanup이 없을 때도 배열 체크 발생
- 역순 정리 고려 (최근 것부터)

**개선 방안**:
1. **빠른 경로**: cleanup이 없을 때 즉시 반환 (이미 구현됨 ✅)
2. **역순 정리**: 최근 cleanup부터 실행하여 의존성 순서 보장
3. **배열 재사용**: `cleanups.length = 0` 대신 재사용 고려

**예상 성능 향상**: 1-3% (cleanup이 많을 때)

---

### 6. ⚠️ **낮은 우선순위** - DevTools 체크 최적화

**위치**: `packages/flexium/src/core/signal.ts:373-375, 384-386`

**문제점**:
```typescript
if (devToolsId >= 0 && devToolsHooks?.onSignalUpdate) {
  devToolsHooks.onSignalUpdate(devToolsId, newValue)
}
```

- Production 빌드에서도 체크 발생
- Optional chaining 오버헤드

**개선 방안**:
1. **빠른 경로**: DevTools가 비활성화일 때 체크 스킵
2. **조건부 컴파일**: Production 빌드에서 완전히 제거 (빌드 도구 설정 필요)

**예상 성능 향상**: 1-2% (production에서)

---

### 7. ⚠️ **낮은 우선순위** - normalizeClass 재귀 최적화

**위치**: `packages/flexium/src/renderers/dom/index.ts:373-400`

**문제점**:
```typescript
function normalizeClass(value: any): string {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = typeof item === 'string' ? item : normalizeClass(item)  // 재귀
    }
  }
}
```

- 깊은 중첩 배열에서 재귀 호출 오버헤드
- 스택 오버플로우 위험 (매우 깊은 경우)

**개선 방안**:
1. **반복적 구현**: 재귀 대신 스택 기반 반복 구현
2. **깊이 제한**: 최대 깊이 제한 및 경고

**예상 성능 향상**: 2-5% (깊은 중첩이 있을 때)

---

### 8. ⚠️ **중간 우선순위** - mountReactive 불필요한 재생성

**위치**: `packages/flexium/src/renderers/dom/reactive.ts:76-490`

**문제점**:
```typescript
export function mountReactive(node, container) {
  // 많은 타입 체크와 분기
  if (isListComponent(node)) { ... }
  if (isStateValue(node)) { ... }
  if (isSignal(node) || typeof node === 'function') { ... }
  // ...
}
```

- 매번 여러 타입 체크 수행
- 함수 컴포넌트에서 매번 새로운 effect 생성

**개선 방안**:
1. **타입 캐싱**: 노드 타입을 한 번만 체크하고 캐싱
2. **Effect 재사용**: 컴포넌트 인스턴스별로 effect 재사용 고려
3. **빠른 경로**: 가장 일반적인 케이스(일반 FNode)를 먼저 체크

**예상 성능 향상**: 5-10% (복잡한 컴포넌트 트리에서)

---

### 9. ⚠️ **높은 우선순위** - updateStyles 반복 속성 접근

**위치**: `packages/flexium/src/renderers/dom/index.ts:264-367`

**문제점**:
```typescript
function updateStyles(element, oldProps, newProps) {
  const style = element.style  // 한 번만 읽음 ✅
  
  // 하지만 여러 곳에서 style[cssProp] 반복 접근
  if (style[cssProp] !== transformedValue) {
    style[cssProp] = transformedValue
  }
}
```

- CSS 속성 접근이 반복됨
- `style.setProperty` vs 직접 할당 성능 차이

**개선 방안**:
1. **배치 업데이트**: 변경사항을 모아서 한 번에 적용
2. **setProperty 최적화**: `setProperty` 사용 시 kebab-case 변환 최적화

**예상 성능 향상**: 3-7% (많은 스타일 업데이트가 있을 때)

---

### 10. ⚠️ **중간 우선순위** - createReactiveRoot innerHTML 사용

**위치**: `packages/flexium/src/renderers/dom/reactive.ts:565-595`

**문제점**:
```typescript
render(node: FNode) {
  if (currentRootNode) {
    cleanupReactive(currentRootNode)
    container.innerHTML = ''  // 전체 DOM 제거
  }
  // ...
  rootDispose = effect(() => {
    container.innerHTML = ''  // 매번 전체 제거
    currentRootNode = mountReactive(node, container)
  })
}
```

- `innerHTML = ''`는 전체 DOM을 제거하고 재생성
- 기존 노드 재사용 불가

**개선 방안**:
1. **점진적 업데이트**: `innerHTML` 대신 기존 노드와 reconcile
2. **재사용**: 가능한 경우 기존 노드 재사용

**예상 성능 향상**: 30-50% (큰 앱에서 root 재렌더링 시)

---

## 📈 우선순위별 개선 계획

### 🔴 높은 우선순위 (즉시 개선 권장)

1. **State Proxy 캐싱** - 가장 큰 영향, 구현 난이도: 낮음
2. **DOM 업데이트 배치** - 큰 성능 향상, 구현 난이도: 중간
3. **createReactiveRoot 최적화** - 큰 앱에서 큰 영향, 구현 난이도: 중간

### 🟡 중간 우선순위 (단기 개선)

4. **reconcileArrays 메모리 최적화** - 큰 리스트에서 효과
5. **mountReactive 최적화** - 복잡한 컴포넌트에서 효과
6. **updateStyles 최적화** - 많은 스타일 업데이트에서 효과
7. **setupReactiveProps 최적화** - 많은 props에서 효과

### 🟢 낮은 우선순위 (장기 개선)

8. **Effect cleanup 최적화** - 미미한 효과
9. **DevTools 체크 최적화** - Production에서만 효과
10. **normalizeClass 최적화** - 특수 케이스에서만 효과

## 🎯 예상 전체 성능 향상

모든 개선 사항을 적용하면:
- **Signal 업데이트**: 15-25% 향상
- **State 생성/접근**: 20-35% 향상
- **DOM 업데이트**: 25-45% 향상
- **메모리 사용량**: 10-20% 감소
- **전체적인 반응성**: 20-30% 향상

## 📝 구현 시 주의사항

1. **기존 테스트 유지**: 모든 변경사항은 기존 테스트를 통과해야 함
2. **벤치마크 추가**: 개선 전후 성능 측정 필수
3. **점진적 적용**: 한 번에 하나씩 적용하고 테스트
4. **메모리 프로파일링**: 메모리 사용량 모니터링
5. **브라우저 호환성**: 모든 최적화가 브라우저에서 동작하는지 확인

## 🔬 벤치마크 제안

다음 시나리오로 성능 측정 권장:
- 많은 구독자가 있는 Signal 업데이트 (1000+ subscribers)
- 깊은 computed 체인 (20+ levels)
- 많은 async state 동시 처리 (100+ resources)
- 큰 객체 상태 접근 (1000+ properties)
- 큰 리스트 렌더링 (10000+ items)
- 복잡한 컴포넌트 트리 (1000+ components)

## 💡 추가 최적화 아이디어

1. **Web Workers**: 무거운 computed 계산을 웹 워커로 이동
2. **Virtual Scrolling**: 큰 리스트에 대한 가상 스크롤링 최적화
3. **Code Splitting**: 라우터 기반 코드 스플리팅
4. **Tree Shaking**: 사용하지 않는 코드 제거 최적화
5. **SSR 최적화**: 서버 사이드 렌더링 성능 개선

## 📚 참고 자료

- 기존 성능 문서: `docs/PERFORMANCE_IMPROVEMENTS.md`
- 고급 최적화: `docs/ADVANCED_PERFORMANCE.md`
- 벤치마크: `tests/performance/benchmark.mjs`
