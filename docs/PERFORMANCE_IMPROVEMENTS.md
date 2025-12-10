# Core 성능 개선 사항 분석

## 🔍 발견된 성능 이슈 및 개선 제안

### 1. Signal.notify() - instanceof 체크 최적화 ⚠️ **높은 우선순위**

**위치**: `packages/flexium/src/core/signal.ts:137, 242, 287`

**문제점**:
```typescript
// 현재 코드
while (link) {
  const sub = link.sub!
  if (sub instanceof ComputedNode) {  // 매번 instanceof 체크
    sub.execute()
  } else {
    addToAutoBatch(sub)
  }
  link = link.nextSub
}
```

**개선 방안**:
- `ISubscriber` 인터페이스에 타입 식별자 추가 (enum 또는 숫자)
- `instanceof` 대신 숫자 비교로 변경 (더 빠름)
- 또는 Link에 타입 플래그 저장

**예상 성능 향상**: 10-20% (많은 구독자가 있을 때)

---

### 2. State Proxy 생성 오버헤드 ⚠️ **높은 우선순위**

**위치**: `packages/flexium/src/core/state.ts:234-329`

**문제점**:
- 매 `state()` 호출마다 새로운 Proxy 객체 생성
- Proxy의 `get` 트랩이 매번 실행되어 오버헤드 발생
- 객체/배열 접근 시 매번 `sig.value` 호출로 의존성 추적

**개선 방안**:
```typescript
// Proxy 대신 더 가벼운 래퍼 사용 고려
// 또는 Proxy를 한 번만 생성하고 재사용
// 또는 객체 접근 시 lazy tracking (첫 접근 시에만 추적)
```

**예상 성능 향상**: 15-30% (객체 상태가 많을 때)

---

### 3. ComputedNode._needsRefetch() 중복 계산 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/signal.ts:231-253`

**문제점**:
```typescript
private _needsRefetch(): boolean {
  if (!this.depsHead) return true;
  
  let link: Link | undefined = this.depsHead
  while (link) {
    const dep = link.dep!
    if (dep.version > this.lastCleanEpoch) {
      return true
    }
    
    if (dep instanceof ComputedNode) {
      if (Flags.has(dep, SubscriberFlags.Dirty | SubscriberFlags.Stale)) {
        dep.peek()  // 여기서 peek() 호출 시 또 계산될 수 있음
        if (dep.version > this.lastCleanEpoch) {
          return true
        }
      }
    }
    link = link.nextDep
  }
  return false
}
```

**개선 방안**:
- `dep.peek()` 호출 전에 이미 dirty/stale 체크를 했으므로, 중복 체크 제거
- `lastCleanEpoch` 비교를 더 효율적으로

**예상 성능 향상**: 5-10% (복잡한 computed 체인이 있을 때)

---

### 4. Scheduler - Set 복사 오버헤드 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/scheduler.ts:19-28`

**문제점**:
```typescript
export function flushAutoBatch(): void {
  isAutoBatchScheduled = false
  if (autoBatchQueue.size === 0) return
  
  const queue = new Set(autoBatchQueue)  // 전체 복사
  autoBatchQueue.clear()
  
  queue.forEach((sub) => sub.execute())
}
```

**개선 방안**:
- Set 복사 대신 배열로 변환 후 clear
- 또는 두 개의 Set을 swap하는 방식 사용

**예상 성능 향상**: 3-5% (큰 배치가 있을 때)

---

### 5. State Proxy - 반복적인 타입 체크 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/state.ts:246-290`

**문제점**:
```typescript
get(_target, prop) {
  // ... 여러 체크들 ...
  
  const currentValue = sig.value  // 매번 호출
  
  if (currentValue !== null && typeof currentValue === 'object') {
    // 이 체크가 여러 곳에서 반복됨
  }
}
```

**개선 방안**:
- `currentValue`를 한 번만 읽고 캐싱
- 타입 체크 결과를 재사용

**예상 성능 향상**: 5-8% (객체 상태 접근이 많을 때)

---

### 6. Global State Registry - 키 직렬화 최적화 ✅ **이미 최적화됨**

**위치**: `packages/flexium/src/core/state.ts:126-155`

**현재 상태**: WeakMap 캐시 사용 중 (좋음)

**추가 개선 가능**:
- 문자열 키는 직렬화 불필요하므로 빠른 경로 추가
- 이미 구현되어 있음 ✅

---

### 7. Effect Cleanup 배열 순회 ⚠️ **낮은 우선순위**

**위치**: `packages/flexium/src/core/effect.ts:54-58`

**문제점**:
```typescript
private run(): void {
  for (const cleanup of this.cleanups) {  // 배열 순회
    cleanup()
  }
  this.cleanups = []
  // ...
}
```

**개선 방안**:
- cleanup이 없을 때 빠른 경로 추가
- 또는 역순으로 순회 (최근 것부터 정리)

**예상 성능 향상**: 1-3% (cleanup이 많을 때)

---

### 8. LinkPool 크기 제한 ⚠️ **낮은 우선순위**

**위치**: `packages/flexium/src/core/graph.ts:113`

**문제점**:
```typescript
if (size < 10000) {  // 하드코딩된 제한
  pool[size++] = link
}
```

**개선 방안**:
- 동적 제한 (메모리 사용량 기반)
- 또는 제한을 설정 가능하게

**예상 성능 향상**: 메모리 사용량 개선

---

### 9. DevTools 체크 최적화 ⚠️ **낮은 우선순위**

**위치**: `packages/flexium/src/core/signal.ts:335-337, 346-348`

**문제점**:
```typescript
if (devToolsId >= 0 && devToolsHooks?.onSignalUpdate) {
  devToolsHooks.onSignalUpdate(devToolsId, newValue)
}
```

**개선 방안**:
- DevTools가 비활성화일 때 빠른 경로
- 또는 조건부 컴파일 (production 빌드에서 제거)

**예상 성능 향상**: 1-2% (production에서)

---

### 10. State 함수 내부 재귀 호출 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/core/state.ts:470-477, 514-520, 553-559`

**문제점**:
```typescript
// Async state에서 status와 error를 위해 state() 재호출
const [statusValue] = state<AsyncStatus>(() => {
  if (s.error) return 'error'
  if (s.loading) return 'loading'
  if (s.value !== undefined) return 'success'
  return 'idle'
})
const [errorValue] = state<unknown>(() => s.error)
```

**개선 방안**:
- status와 error를 별도의 computed로 직접 생성
- 또는 Resource 내부에서 직접 관리

**예상 성능 향상**: 5-10% (async state가 많을 때)

---

### 11. Owner Context 객체 생성 ⚠️ **낮은 우선순위**

**위치**: `packages/flexium/src/core/owner.ts:85, context.ts:54`

**문제점**:
```typescript
context: prevOwner ? Object.create(prevOwner.context) : null
// 또는
if (!owner.context) {
  owner.context = {}  // 동적 생성
}
```

**개선 방안**:
- Context가 없을 때 빠른 경로
- Object.create 대신 더 가벼운 방법 고려

**예상 성능 향상**: 2-3% (많은 context 사용 시)

---

### 12. ComputedNode 버전 비교 최적화 ✅ **이미 최적화됨**

**위치**: `packages/flexium/src/core/signal.ts:238`

**현재 상태**: `lastCleanEpoch` 사용으로 불필요한 재계산 방지 (좋음)

---

## 📊 우선순위별 개선 계획

### 🔴 높은 우선순위 (즉시 개선 권장)
1. **Signal.notify() instanceof 최적화** - 가장 큰 영향
2. **State Proxy 생성 최적화** - 자주 호출되는 경로

### 🟡 중간 우선순위 (단기 개선)
3. **ComputedNode._needsRefetch() 최적화**
4. **Scheduler Set 복사 최적화**
5. **State Proxy 타입 체크 최적화**
6. **State 함수 내부 재귀 호출 최적화**

### 🟢 낮은 우선순위 (장기 개선)
7. **Effect Cleanup 최적화**
8. **LinkPool 동적 제한**
9. **DevTools 체크 최적화**
10. **Owner Context 최적화**

## 🎯 예상 전체 성능 향상

모든 개선 사항을 적용하면:
- **Signal 업데이트**: 20-30% 향상
- **State 생성/접근**: 15-25% 향상
- **Computed 재계산**: 10-15% 향상
- **전체적인 반응성**: 15-20% 향상

## 📝 구현 시 주의사항

1. **기존 테스트 유지**: 모든 변경사항은 기존 테스트를 통과해야 함
2. **벤치마크 추가**: 개선 전후 성능 측정
3. **점진적 적용**: 한 번에 하나씩 적용하고 테스트
4. **메모리 프로파일링**: 메모리 사용량 모니터링

## 🔬 벤치마크 제안

다음 시나리오로 성능 측정 권장:
- 많은 구독자가 있는 Signal 업데이트
- 깊은 computed 체인
- 많은 async state 동시 처리
- 큰 객체 상태 접근
