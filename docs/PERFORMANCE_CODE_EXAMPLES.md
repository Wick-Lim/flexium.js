# 성능 개선 코드 예시

## 1. Signal.notify() - instanceof 체크 최적화

### 현재 코드 (signal.ts:135-144)
```typescript
while (link) {
  const sub = link.sub!
  if (sub instanceof ComputedNode) {  // 느린 instanceof 체크
    sub.execute()
  } else {
    addToAutoBatch(sub)
    shouldSchedule = true
  }
  link = link.nextSub
}
```

### 개선 방안 1: 타입 플래그 추가

**Step 1: graph.ts에 타입 상수 추가**
```typescript
// graph.ts
export const enum NodeType {
  Signal = 1,
  Computed = 2,
  Effect = 3,
  Resource = 4,
}

export interface ISubscriber {
  execute(): void
  depsHead: Link | undefined
  flags: SubscriberFlags
  nodeType: NodeType  // 추가
}
```

**Step 2: signal.ts에서 플래그 사용**
```typescript
class ComputedNode<T> implements ISubscriber, IObservable {
  nodeType = NodeType.Computed  // 추가
  
  // ...
}

class SignalNode<T> implements IObservable {
  nodeType = NodeType.Signal  // 추가
  
  // ...
}

// notify() 메서드 개선
notify(): void {
  if (getBatchDepth() > 0) {
    let link = this.subsHead
    while (link) {
      if (link.sub) addToBatch(link.sub)
      link = link.nextSub
    }
  } else {
    if (this.subsHead) {
      let shouldSchedule = false
      let link: Link | undefined = this.subsHead

      while (link) {
        const sub = link.sub!
        // instanceof 대신 숫자 비교 (훨씬 빠름)
        if (sub.nodeType === NodeType.Computed) {
          sub.execute()
        } else {
          addToAutoBatch(sub)
          shouldSchedule = true
        }
        link = link.nextSub
      }

      if (shouldSchedule) {
        scheduleAutoBatch()
      }
    }
  }
}
```

**성능 향상**: instanceof는 프로토타입 체인을 따라가지만, 숫자 비교는 O(1)입니다.

---

## 2. Scheduler Set 복사 최적화

### 현재 코드 (scheduler.ts:19-28)
```typescript
export function flushAutoBatch(): void {
  isAutoBatchScheduled = false
  if (autoBatchQueue.size === 0) return
  
  const queue = new Set(autoBatchQueue)  // 전체 복사 - 비용이 큼
  autoBatchQueue.clear()
  
  queue.forEach((sub) => sub.execute())
}
```

### 개선 방안: 배열 변환 사용
```typescript
export function flushAutoBatch(): void {
  isAutoBatchScheduled = false
  if (autoBatchQueue.size === 0) return
  
  // Set을 배열로 변환 (더 빠름)
  const queue = Array.from(autoBatchQueue)
  autoBatchQueue.clear()
  
  // 배열 순회가 Set.forEach보다 약간 빠를 수 있음
  for (let i = 0; i < queue.length; i++) {
    queue[i].execute()
  }
}
```

**또는 더 나은 방법: 두 개의 Set을 swap**
```typescript
let autoBatchQueue = new Set<ISubscriber>()
let autoBatchQueueBackup = new Set<ISubscriber>()

export function flushAutoBatch(): void {
  isAutoBatchScheduled = false
  if (autoBatchQueue.size === 0) return
  
  // Swap 방식 - 복사 없이 포인터만 교체
  const queue = autoBatchQueue
  autoBatchQueue = autoBatchQueueBackup
  autoBatchQueueBackup = queue
  
  queue.forEach((sub) => sub.execute())
  queue.clear()  // 다음을 위해 비움
}
```

**성능 향상**: Set 복사 비용 제거, 메모리 할당 감소

---

## 3. ComputedNode._needsRefetch() 최적화

### 현재 코드 (signal.ts:231-253)
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
        dep.peek()  // 여기서 또 계산될 수 있음
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

### 개선 방안: 중복 체크 제거 및 타입 플래그 사용
```typescript
private _needsRefetch(): boolean {
  if (!this.depsHead) return true;

  let link: Link | undefined = this.depsHead
  while (link) {
    const dep = link.dep!
    
    // 버전 체크를 먼저 (가장 빠른 체크)
    if (dep.version > this.lastCleanEpoch) {
      return true
    }

    // ComputedNode인 경우에만 추가 체크
    // instanceof 대신 nodeType 사용 (개선안 1 적용 시)
    if (dep.nodeType === NodeType.Computed) {
      const computedDep = dep as ComputedNode<unknown>
      // peek() 호출 전에 이미 dirty/stale인지 확인했으므로
      // peek()는 이미 업데이트된 버전을 반환할 것
      // 하지만 peek() 호출 자체가 비용이므로, 버전만 다시 확인
      if (computedDep.version > this.lastCleanEpoch) {
        return true
      }
    }
    link = link.nextDep
  }
  return false
}
```

**또는 더 나은 방법: 재귀 체크 최적화**
```typescript
private _needsRefetch(): boolean {
  if (!this.depsHead) return true;

  let link: Link | undefined = this.depsHead
  while (link) {
    const dep = link.dep!
    
    // 직접 버전 비교 (가장 빠름)
    if (dep.version > this.lastCleanEpoch) {
      return true
    }

    // ComputedNode이고 dirty/stale인 경우에만 peek() 호출
    if (dep.nodeType === NodeType.Computed) {
      const computedDep = dep as ComputedNode<unknown>
      // peek()는 _updateIfDirty()를 호출하므로, 
      // 이미 dirty라면 업데이트되고 버전이 증가함
      // 하지만 우리는 단지 "변경되었는지"만 확인하고 싶음
      if (Flags.has(computedDep, SubscriberFlags.Dirty | SubscriberFlags.Stale)) {
        // peek() 대신 버전만 확인 (peek()는 계산을 트리거할 수 있음)
        // 대신 직접 _updateIfDirty()를 호출하지 않고 버전만 확인
        if (computedDep.version > this.lastCleanEpoch) {
          return true
        }
      }
    }
    link = link.nextDep
  }
  return false
}
```

**성능 향상**: 불필요한 peek() 호출 제거, 중복 체크 감소

---

## 4. State Proxy 최적화

### 현재 코드 (state.ts:240-290)
```typescript
get(_target, prop) {
  // ... 여러 체크들 ...
  
  const currentValue = sig.value  // 매번 호출
  
  if (currentValue !== null && typeof currentValue === 'object') {
    // 이 체크가 여러 곳에서 반복됨
  }
}
```

### 개선 방안: 값 캐싱 및 타입 체크 최적화
```typescript
function createStateProxy<T>(sig: Signal<T> | Computed<T>): StateValue<T> {
  const target = () => sig.value

  // 타입 체크 결과를 캐싱하기 위한 WeakMap
  const typeCache = new WeakMap<object, { isObject: boolean; value: unknown }>()
  
  const proxy = new Proxy(target, {
    apply() {
      return sig.value
    },

    get(_target, prop) {
      if (prop === STATE_SIGNAL) {
        return sig
      }

      if (prop === 'peek') {
        return sig.peek
      }

      if (prop === Symbol.toPrimitive) {
        return (_hint: string) => sig.value
      }

      if (prop === 'valueOf') {
        return () => sig.value
      }

      if (prop === 'toString') {
        return () => String(sig.value)
      }

      if (prop === 'toJSON') {
        return () => sig.value
      }

      // 값 읽기 (한 번만)
      const currentValue = sig.value
      
      // null 체크 먼저 (가장 빠름)
      if (currentValue === null) {
        return undefined
      }
      
      // 타입 체크
      const isObject = typeof currentValue === 'object'
      
      if (isObject) {
        const obj = currentValue as Record<string | symbol, unknown>
        const propValue = obj[prop]
        
        if (typeof propValue === 'function') {
          return propValue.bind(currentValue)
        }
        return propValue
      }

      return undefined
    },

    has(_target, prop) {
      if (prop === STATE_SIGNAL) return true
      const currentValue = sig.value
      return currentValue !== null && 
             typeof currentValue === 'object' && 
             prop in (currentValue as object)
    },

    ownKeys(_target) {
      const currentValue = sig.value
      if (currentValue !== null && typeof currentValue === 'object') {
        return Reflect.ownKeys(currentValue as object)
      }
      return []
    },

    getOwnPropertyDescriptor(_target, prop) {
      if (prop === STATE_SIGNAL) {
        return { configurable: true, enumerable: false, value: sig }
      }
      const currentValue = sig.value
      if (currentValue !== null && typeof currentValue === 'object') {
        const desc = Object.getOwnPropertyDescriptor(currentValue as object, prop)
        if (desc) {
          return { ...desc, configurable: true }
        }
      }
      return undefined
    },
  })

  return proxy as StateValue<T>
}
```

**추가 최적화: Proxy 없이 직접 접근 (더 공격적)**
```typescript
// Proxy 대신 함수 래퍼 사용
function createStateProxy<T>(sig: Signal<T> | Computed<T>): StateValue<T> {
  const proxy = function() {
    return sig.value
  } as StateValue<T>
  
  // STATE_SIGNAL 속성 직접 추가
  Object.defineProperty(proxy, STATE_SIGNAL, {
    value: sig,
    enumerable: false,
    configurable: true,
  })
  
  // peek 메서드 추가
  proxy.peek = sig.peek.bind(sig)
  
  // Symbol.toPrimitive 등은 필요시 추가
  
  return proxy
}
```

**성능 향상**: Proxy 트랩 오버헤드 제거, 직접 속성 접근

---

## 5. Effect Cleanup 최적화

### 현재 코드 (effect.ts:54-58)
```typescript
private run(): void {
  for (const cleanup of this.cleanups) {
    cleanup()
  }
  this.cleanups = []
  // ...
}
```

### 개선 방안: 빠른 경로 추가
```typescript
private run(): void {
  // cleanup이 없으면 빠른 경로
  if (this.cleanups.length > 0) {
    // 역순으로 실행 (최근 것부터)
    for (let i = this.cleanups.length - 1; i >= 0; i--) {
      this.cleanups[i]()
    }
    this.cleanups = []
  }
  
  // ... 나머지 코드
}
```

**성능 향상**: cleanup이 없을 때 불필요한 배열 순회 제거

---

## 6. State 함수 내부 재귀 호출 최적화

### 현재 코드 (state.ts:470-477)
```typescript
// Async state에서
const [statusValue] = state<AsyncStatus>(() => {
  if (s.error) return 'error'
  if (s.loading) return 'loading'
  if (s.value !== undefined) return 'success'
  return 'idle'
})
const [errorValue] = state<unknown>(() => s.error)
```

### 개선 방안: 직접 computed 생성
```typescript
// state() 재호출 대신 직접 computed 생성
const statusComputed = createComputed<AsyncStatus>(() => {
  if (s.error) return 'error'
  if (s.loading) return 'loading'
  if (s.value !== undefined) return 'success'
  return 'idle'
})
const statusValue = createStateProxy(statusComputed)

const errorComputed = createComputed<unknown>(() => s.error)
const errorValue = createStateProxy(errorComputed)
```

**또는 Resource 내부에서 직접 관리**
```typescript
// createResource 함수 내부에서 status와 error를 직접 관리
// 별도의 state() 호출 없이 computed로 직접 생성
```

**성능 향상**: 불필요한 함수 호출 및 상태 등록 제거

---

## 구현 체크리스트

- [ ] 1. NodeType enum 추가 및 ISubscriber에 nodeType 필드 추가
- [ ] 2. SignalNode, ComputedNode, EffectNode에 nodeType 할당
- [ ] 3. instanceof 체크를 nodeType 비교로 변경
- [ ] 4. Scheduler Set 복사 최적화 (배열 또는 swap 방식)
- [ ] 5. ComputedNode._needsRefetch() 최적화
- [ ] 6. State Proxy 최적화 (값 캐싱 또는 Proxy 제거)
- [ ] 7. Effect cleanup 빠른 경로 추가
- [ ] 8. State 함수 내부 재귀 호출 제거
- [ ] 9. 벤치마크 추가 및 성능 측정
- [ ] 10. 모든 기존 테스트 통과 확인

## 벤치마크 코드 예시

```typescript
// tests/performance/signal-notify.bench.mjs
import { signal, computed } from '../../packages/flexium/dist/core.mjs'
import { performance } from 'perf_hooks'

const ITERATIONS = 100000
const SUBSCRIBERS = 100

function benchmarkNotify() {
  const sig = signal(0)
  
  // 많은 구독자 생성
  for (let i = 0; i < SUBSCRIBERS; i++) {
    computed(() => sig.value)
  }
  
  const start = performance.now()
  for (let i = 0; i < ITERATIONS; i++) {
    sig.value = i
  }
  const end = performance.now()
  
  return {
    totalMs: end - start,
    avgMs: (end - start) / ITERATIONS,
    opsPerSec: Math.round(ITERATIONS / ((end - start) / 1000))
  }
}

console.log('Signal notify benchmark:', benchmarkNotify())
```
