# 추가 성능 개선 사항 분석 (V2)

## 🔍 새로 발견된 성능 이슈 및 개선 제안

### 1. Scheduler Set 복사 최적화 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/scheduler.ts:19-28, 64-78`

**문제점**:
```typescript
// 현재 코드
export function flushAutoBatch(): void {
  const queue = new Set(autoBatchQueue)  // 전체 Set 복사
  autoBatchQueue.clear()
  queue.forEach((sub) => sub.execute())
}

export function sync<T>(fn?: () => T): T | void {
  // ...
  const queue = new Set(batchQueue)  // 전체 Set 복사
  batchQueue.clear()
  queue.forEach((sub) => sub.execute())
}
```

**개선 방안**:
- Set 복사 대신 배열로 변환 (더 빠름)
- 또는 두 개의 Set을 swap하는 방식 사용

**예상 성능 향상**: 3-5% (큰 배치가 있을 때)

---

### 2. State 함수 내부 재귀 호출 제거 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/state.ts:497-503, 541-547, 553-559, 579-585`

**문제점**:
```typescript
// Async state에서 매번 state() 재호출
const [statusValue] = state<AsyncStatus>(() => {
  if (s.error) return 'error'
  if (s.loading) return 'loading'
  if (s.value !== undefined) return 'success'
  return 'idle'
})
const [errorValue] = state<unknown>(() => s.error)
```

**개선 방안**:
- `state()` 재호출 대신 직접 `createComputed` 사용
- 또는 Resource 내부에서 직접 관리

**예상 성능 향상**: 5-10% (async state가 많을 때)

---

### 3. Async 함수 감지 최적화 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/state.ts:527`

**문제점**:
```typescript
// constructor.name 체크는 느림
const isAsyncFn = originalFn.constructor.name === 'AsyncFunction'
```

**개선 방안**:
- 함수를 실행해서 Promise 반환 여부로 판단 (이미 하고 있음)
- constructor.name 체크 제거하고 바로 실행 결과로 판단
- 또는 Symbol.asyncIterator 체크

**예상 성능 향상**: 2-3% (함수 생성이 많을 때)

---

### 4. Effect Cleanup 빠른 경로 ⚠️ **낮은 우선순위**

**위치**: `packages/flexium/src/core/effect.ts:56-60`

**문제점**:
```typescript
private run(): void {
  for (const cleanup of this.cleanups) {  // 항상 순회
    cleanup()
  }
  this.cleanups = []
  // ...
}
```

**개선 방안**:
- cleanup이 없을 때 빠른 경로 추가
- 배열 길이 체크 먼저

**예상 성능 향상**: 1-3% (cleanup이 많을 때)

---

### 5. State 함수의 Promise 체크 최적화 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/state.ts:554-568`

**문제점**:
```typescript
// 매번 함수를 실행해서 Promise인지 체크
let testResult: T | Promise<T>
try {
  testResult = fn()  // 함수 실행 비용
} catch {
  // ...
}

if (testResult instanceof Promise) {
  // ...
}
```

**개선 방안**:
- constructor.name 체크를 먼저 하고, 실패 시에만 실행
- 또는 함수의 toString()을 체크 (더 빠를 수 있음)

**예상 성능 향상**: 3-5% (함수 상태 생성이 많을 때)

---

### 6. LinkPool 배열 접근 최적화 ⚠️ **낮은 우선순위**

**위치**: `packages/flexium/src/core/graph.ts:95-104`

**문제점**:
```typescript
export function alloc(dep: IObservable, sub: ISubscriber): Link {
  if (size > 0) {
    const link = pool[--size]  // 배열 접근
    // 여러 속성 할당
    link.dep = dep
    link.sub = sub
    link.prevSub = undefined
    link.prevDep = undefined
    link.nextDep = undefined
    link.nextSub = undefined
    return link
  }
  // ...
}
```

**개선 방안**:
- 속성 할당을 한 번에 (Object.assign 사용)
- 또는 구조 분해 할당

**예상 성능 향상**: 1-2% (많은 의존성이 있을 때)

---

### 7. State Proxy의 반복적인 속성 접근 ⚠️ **낮은 우선순위**

**위치**: `packages/flexium/src/core/state.ts:246-290`

**문제점**:
- Proxy의 get 트랩에서 매번 여러 속성 체크
- Symbol 비교가 여러 번 발생

**개선 방안**:
- 속성 체크 순서 최적화 (가장 자주 사용되는 것 먼저)
- Symbol 비교를 상수로 캐싱

**예상 성능 향상**: 2-3% (프록시 접근이 많을 때)

---

### 8. Global State Registry 조회 최적화 ✅ **이미 최적화됨**

**위치**: `packages/flexium/src/core/state.ts:483`

**현재 상태**: Map.has() 사용 (O(1)) - 이미 최적화됨

---

### 9. Key 직렬화 캐시 최적화 ✅ **이미 최적화됨**

**위치**: `packages/flexium/src/core/state.ts:126-155`

**현재 상태**: WeakMap 캐시 사용 - 이미 최적화됨

---

### 10. ComputedNode._needsRefetch() 중복 peek() 호출 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/signal.ts:246-253`

**문제점**:
```typescript
if (dep.nodeType === NodeType.Computed) {
  const computedDep = dep as ComputedNode<unknown>
  if (Flags.has(computedDep, SubscriberFlags.Dirty | SubscriberFlags.Stale)) {
    computedDep.peek()  // 여기서 계산이 트리거될 수 있음
    if (computedDep.version > this.lastCleanEpoch) {
      return true
    }
  }
}
```

**개선 방안**:
- peek() 호출 전에 버전만 확인
- 또는 peek() 결과를 캐싱

**예상 성능 향상**: 5-8% (복잡한 computed 체인이 있을 때)

---

### 11. Signal.set() 값 비교 최적화 ⚠️ **낮은 우선순위**

**위치**: `packages/flexium/src/core/signal.ts:109-115`

**문제점**:
```typescript
set(newValue: T): void {
  if (this._value !== newValue) {  // 단순 비교
    this._value = newValue
    this.version = ++globalVersion
    this.notify()
  }
}
```

**개선 방안**:
- Object.is() 사용 (NaN, +0/-0 처리)
- 하지만 대부분의 경우 단순 비교가 더 빠름
- 현재 구현이 적절함

**예상 성능 향상**: 미미함 (현재 구현이 이미 최적화됨)

---

### 12. Effect 실행 중 중복 스케줄링 방지 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/effect.ts:34-52`

**문제점**:
```typescript
execute(): void {
  if (Flags.has(this, SubscriberFlags.Running)) {
    Flags.add(this, SubscriberFlags.Notified)
    return
  }
  // ...
  if (Flags.has(this, SubscriberFlags.Notified)) {
    queueMicrotask(() => this.execute())  // 매번 microtask 생성
  }
}
```

**개선 방안**:
- microtask가 이미 스케줄되었는지 확인
- 또는 배치로 처리

**예상 성능 향상**: 2-4% (많은 effect가 있을 때)

---

## 📊 우선순위별 개선 계획

### 🟡 중간 우선순위 (단기 개선)
1. **Scheduler Set 복사 최적화** - 구현 간단, 즉시 효과
2. **State 함수 내부 재귀 호출 제거** - 큰 영향
3. **Async 함수 감지 최적화** - 구현 간단
4. **Promise 체크 최적화** - 구현 간단
5. **ComputedNode._needsRefetch() 최적화** - 복잡한 체인에서 효과

### 🟢 낮은 우선순위 (장기 개선)
6. **Effect Cleanup 빠른 경로** - 구현 간단
7. **LinkPool 배열 접근 최적화** - 미미한 효과
8. **State Proxy 속성 접근 최적화** - 미미한 효과
9. **Effect 실행 중 중복 스케줄링 방지** - 구현 복잡

## 🎯 예상 전체 성능 향상

모든 중간 우선순위 개선 사항을 적용하면:
- **배치 처리**: 3-5% 향상
- **Async state**: 5-10% 향상
- **함수 상태 생성**: 5-8% 향상
- **Computed 체인**: 5-8% 향상
- **전체적인 반응성**: 5-10% 향상

## 📝 구현 시 주의사항

1. **기존 테스트 유지**: 모든 변경사항은 기존 테스트를 통과해야 함
2. **벤치마크 추가**: 개선 전후 성능 측정
3. **점진적 적용**: 한 번에 하나씩 적용하고 테스트
4. **메모리 프로파일링**: 메모리 사용량 모니터링
